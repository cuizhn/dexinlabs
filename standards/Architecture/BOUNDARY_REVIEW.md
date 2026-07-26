## 代码边界审查报告

> 审查日期：2026-07-25
> 审查范围：`app/markdown/`、`app/content/` 及其与外部的交互
> 审查依据：`standards/Architecture/ARCHITECTURE.md`、`standards/Architecture/ARCHITECTURE_AUDIT.md`

---

### 一、总体结论

两个模块的内部层次结构整体健康。Repository 不依赖 Service，Model 零依赖，markdown 模块完全自包含、不引用任何项目内部模块。但存在 **1 个明确的边界越界** 和 2 个值得关注的问题。

---

### 二、问题清单

#### 问题 1（越界）：LessonService 调用了 @markdown

**文件**：`app/content/services/LessonService.ts` 第 7 行

```ts
import { renderToHTML } from '@markdown'
```

`getLessonPage()` 方法在第 48-52 行调用 `renderToHTML()` 将 `body`、`intro`、`summaryText` 三个 Markdown 字段渲染为 HTML。

**为什么是越界**：

ARCHITECTURE.md 明确规定 Service 的职责是「上一篇/下一篇、导航、权限判断、内容组合」，不负责「Markdown 渲染、HTML 生成」。ARCHITECTURE_AUDIT.md 在模块职责中再次确认：Service 不负责 Markdown 解析。

当前数据流是：

```
API → LessonService → renderToHTML() → 返回 bodyHtml/introHtml/summaryHtml
```

正确的数据流应该是：

```
API → LessonService → 返回原始 Markdown 字段
                      ↓
              Renderer.vue（展示层）→ renderToHTML()
```

**实际影响**：

`Renderer.vue` 已经设计了完整的降级机制——优先使用预渲染的 `bodyHtml`/`introHtml`/`summaryHtml`，没有时才调用 `renderToHTML()` 做运行时渲染。由于 LessonService 已经提前渲染好了 HTML，Renderer 的运行时渲染路径实际上从未在课时页被触发。这意味着：

1. Service 承担了不属于它的渲染职责
2. Renderer 的运行时渲染能力在课时页被浪费
3. 如果未来需要在非课时场景复用 Lesson 数据（如 API 返回原始内容），Service 的渲染逻辑会成为负担

**修复建议**：

`getLessonPage()` 不再调用 `renderToHTML()`，改为将原始 Markdown 字段直接传入 `toLesson()`。`LessonPage` 模型中的 `bodyHtml`/`introHtml`/`summaryHtml` 字段可以保留但暂时留空，由 Renderer.vue 的运行时渲染路径接管。

---

#### 问题 2（一致性）：外部消费者绕过 barrel 直接引用 @content/models

以下 5 个文件使用了 `@content/models` 而非 `@content` barrel：

| 文件 | 导入内容 |
|------|---------|
| `app/composables/useDomainPage.ts` | `DomainPage` |
| `app/composables/useKnowledgeMap.ts` | `DomainPage` |
| `app/composables/useLessonPage.ts` | `LessonPage` |
| `app/composables/useTopicPage.ts` | `TopicPage` |
| `app/pages/exercise/index.vue` | `Exercise` |

这些类型已通过 `content/index.ts` barrel 重新导出，因此功能上没有问题。但从一致性角度，外部消费者应统一使用 `@content` 入口，而非穿透到内部子目录。

**严重程度**：低。全部是 type-only 导入，不影响运行时行为。

**修复建议**：将 `from '@content/models'` 改为 `from '@content'`。

---

#### 问题 3（代码质量）：ServiceFactory.ts 存在未使用的 import

**文件**：`app/content/services/ServiceFactory.ts` 第 1 行

```ts
import { topicRepository, exerciseRepository } from '@content/repositories'
```

这两个 repository 被导入但从未在文件中使用。

**严重程度**：低。不影响功能，但属于死代码。

---

### 三、已通过的检查项

| 检查项 | 结果 | 说明 |
|--------|------|------|
| Repository → Service 反向依赖 | 通过 | 4 个 Repository 均不引用任何 Service |
| Model → Repository/Service 反向依赖 | 通过 | `models/index.ts` 零 import |
| Page → Repository 越层调用 | 通过 | 所有页面只调用 Composable |
| Component → Repository 越层调用 | 通过 | 无组件直接调用 Repository |
| Server API → Repository 越层调用 | 通过 | API 路由只调用 Service（通过 `@content` barrel） |
| markdown → content 反向依赖 | 通过 | markdown 模块零项目内部依赖 |
| barrel 封装完整性 | 通过 | `content/index.ts` 正确隐藏了 BaseRepository、内部工具函数、类构造函数等 |
| 跨模块循环依赖 | 通过 | 依赖方向严格单向：markdown ← content ← API ← Composable ← Page |

---

### 四、架构健康度评估

**markdown/ 模块**：完全自包含，5 个文件职责清晰。Processor 负责管线、Registry 负责注册、Builtin 负责内置插件、types 负责类型、index 负责对外 API。零项目内部依赖，是架构规范中「独立能力层」的标准实现。

**content/ 模块**：16 个文件的分层结构（Model → Repository → Service → Barrel）整体正确。Repository 只做 CRUD，Service 承担业务组合，Model 纯类型定义。唯一越界是 LessonService 中的 Markdown 渲染调用。

**两模块交互**：仅 `LessonService → renderToHTML` 一个交互点。交互方向正确（content 依赖 markdown，而非反向），但职责归属有误——渲染应由展示层（Renderer.vue）而非业务层发起。
