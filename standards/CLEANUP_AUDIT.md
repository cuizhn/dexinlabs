# Content Engine & Markdown Engine 代码收敛审计报告

> **状态**：✅ 清理已完成

## 零、边界违规（架构级问题）✅ 已修复

### Content Engine 越界：承担 Markdown 渲染职责

**原违规位置**：`app/content/services/LessonService.ts`

**修复措施**：
1. ✅ `LessonService.getLessonPage()` 不再调用 `renderToHTML()`，只返回原始 Markdown
2. ✅ 删除 `Lesson` 模型中的 `bodyHtml`/`introHtml`/`summaryHtml` 字段
3. ✅ `useLessonPage` composable 负责调用 `renderToHTML()` 渲染
4. ✅ `[lesson].vue` 页面使用 composable 返回的 `bodyHtml`

**修复后职责边界**：
- Content Engine：获取内容、组合领域对象、内容查询
- Markdown Engine：markdown → AST → HTML
- Composable/Page 层：调用 Markdown Engine 渲染

---

### Markdown Engine：边界合规 ✅

经检查，Markdown Engine 无违规：
- 无 `Lesson`/`Topic`/`Domain`/`Exercise` 引用
- 无数据库查询
- 无 Content Engine 依赖
- 职责单一：markdown → AST → HTML

---

## 一、目录结构差异

### Content Engine 当前结构 vs 目标结构

| 当前 | 目标 | 状态 |
|------|------|------|
| `models/` | `types/` | 待重命名 |
| `services/` | `services/` | ✅ 合规 |
| `repositories/` | `repositories/` | ✅ 合规 |
| 无 | `queries/` | 缺失（可选） |
| `utils.ts` | 无 | 待处理 |
| `ServiceFactory.ts` | 无 | ✅ 已删除 |

### Markdown Engine 当前结构 vs 目标结构

| 当前 | 目标 | 状态 |
|------|------|------|
| `processor.ts` | `parser/` + `renderer/` | 待拆分 |
| `plugins/` | `plugins/` | ✅ 合规 |
| `types.ts` | `types/` | 待调整为目录 |
| 无 | `pipeline/` | 缺失（可选） |

---

## 二、已完成的清理

### 废弃文件 ✅
- [x] 删除 `ServiceFactory.ts`

### 未使用的方法 ✅
- [x] 删除 `DomainService.getDefault()` + `domainRepository.getDefault()`
- [x] 删除 `DomainService.list()`
- [x] 删除 `ExerciseService.listByTopic()`
- [x] 删除 `ExerciseService.getBySlug()` + `exerciseRepository.findBySlug()` 覆写
- [x] 删除 `ExerciseRepository.getOneByTopic()`
- [x] 删除 `LessonService.getBySlug()`

### 未使用的类型/导出 ✅
- [x] 删除 `TopicListOptions` 类型
- [x] 删除 `LessonWithTopic` 类型
- [x] 从 `repositories/index.ts` 移除 `BaseRepository` 导出
- [x] 从 `repositories/index.ts` 移除 `TopicWithRelations`、`LessonWithRelations`、`ExerciseFilters`、`ExerciseListOptions` 导出

### 重复逻辑 ✅
- [x] 合并 `DomainService.getDomainPage()` 和 `getBySlug()`，保留 `getDomainPage()`
- [x] 删除 `TopicService.getBySlug()`，ExerciseService 改用 `topicRepository` 直接查询

### 设计缺陷 ✅
- [x] 重构 `ExerciseService`：删除构造器注入，改用 `topicRepository` 直接查询

### Markdown Engine 清理 ✅
- [x] 移除插件管理 API 的外部导出（`registerPlugin`、`unregisterPlugin`、`getPlugins`、`clearPlugins`、`registerBuiltinPlugins`）

---

## 三、保留清单

以下方法/类型经审计确认有外部调用，已保留：

### Content Engine
- `DomainService.listAllWithTopics()` - 被 `server/api/domains/index.get.ts` 调用
- `DomainService.getDomainPage()` - 被 `server/api/domains/index.get.ts` 调用
- `TopicService.list()` - 被 `server/api/topics/index.get.ts` 调用
- `TopicService.getTopicPage()` - 被 `server/api/topics/[slug].get.ts` 调用
- `LessonService.listByTopic()` - 被 `server/api/lessons/index.get.ts` 调用
- `LessonService.listAll()` - 被 `server/api/lessons/index.get.ts` 调用
- `LessonService.getLessonPage()` - 被 `server/api/lessons/[slug].get.ts` 调用
- `ExerciseService.listByTopicWithMeta()` - 被 `server/api/exercises/index.get.ts` 调用
- `ExerciseService.listAll()` - 被 `server/api/exercises/index.get.ts` 调用
- 所有 Page 类型（`DomainPage`、`TopicPage`、`LessonPage`）- 被 composables 使用
- 所有工具函数（`normalizeSlug`、`toDomain`、`toTopic`、`toLesson`、`toExercise`、`getSiblings`）- 被 Services 使用

### Markdown Engine
- `renderToHTML()` - 被 `useExercisePage` 和 `useLessonPage` 调用
- `MarkdownPlugin` 类型 - 内部使用

---

## 四、清理结果统计

### 已完成
- **边界修复**：1 处（LessonService Markdown 渲染职责迁移至 Composable 层）
- **删除文件**：1 个（ServiceFactory.ts）
- **删除方法**：10 个
- **删除类型/字段**：8 个（含 3 个 HTML 字段）
- **重构**：2 处（ExerciseService 依赖注入、Lesson 渲染流程）
- **清理导出**：4 处（repositories/index.ts、services/index.ts、content/index.ts、markdown/index.ts）

### 待处理（目录结构调整，可选）
- Content Engine: `models/` → `types/`
- Markdown Engine: `processor.ts` → `parser/` + `renderer/`
- Markdown Engine: `types.ts` → `types/`

---

## 五、验证结果

- ✅ TypeScript 编译通过（`npx tsc --noEmit`）
- ✅ ESLint 检查通过（仅剩 BaseRepository.ts 中 3 处预存的 `any` 类型警告，为设计意图）
