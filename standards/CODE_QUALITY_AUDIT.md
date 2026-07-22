## 代码质量审查报告

审查范围：Server API、Repository、Service、Vue Component 全链路
审查日期：2026-07-22

---

### 一、高优先级问题

**1. Service 层对象展开泄漏仓储内部字段**

TopicService、LessonService 在组装页面数据时，使用 `{ ...data, bodyHtml }` 展开仓储层返回的完整对象（含 `topicEntity`、`domainEntity`、`siblingLessons` 等内部字段），然后通过 `as unknown as Lesson` 强制转换。API 响应中会携带这些不应暴露的字段，且类型系统完全无法捕获字段名变更。

> **V2 迁移状态**：已通过 toDomain/toTopic/toLesson/toExercise 映射函数修复，Service 层现在显式选取字段。

建议：在 Service 层显式 pick 所需字段，而非展开整个仓储对象。

**2. Renderer.vue 使用运行时声明定义 Props**

`defineProps({ value: { type: Object } })` 导致 `value` 上所有属性访问（`introHtml`、`bodyHtml`、`body` 等）均为隐式 `any`，完全丧失了 `lang="ts"` 的类型保护。

建议：改用 `defineProps<{ value?: Lesson; content?: string; theme?: string }>()` 泛型声明。

**3. Renderer.vue 异步渲染无取消机制**

`watch(markdownString)` 触发异步 `renderToHTML`，若 props 快速变化，旧的渲染结果可能覆盖新的结果（竞态）。

建议：添加 AbortController 或递增计数器，确保只有最新的渲染结果生效。

**4. 仓储层零错误处理**

全部 20+ 个仓储方法均无 try/catch。数据库连接失败、查询超时等异常会原样传播到调用方。在 Neon Serverless 环境下，瞬态连接失败是常见场景。

建议：至少在仓储基类或关键方法中添加统一的错误包装与日志记录。

---

### 二、中优先级问题

**5. Repository 层 ~90 行重复样板代码**

四个仓储类中，构造函数 + `_getDb()`、`list()`、`getBySlug()`、`getById()` 几乎完全相同，仅表名不同。

> **V2 迁移状态**：已提取 `BaseRepository<T>` 抽象基类至 `app/content/repositories/BaseRepository.ts`，子类通过 `override` 关键字覆写类型收窄方法。

建议：提取 `BaseRepository<T>` 抽象基类，子类只需定义关联查询方法。

**6. 导航（前后主题/课时）逻辑重复**

TopicService 和 LessonService 中计算 previous/next 的代码完全一致。

> **V2 迁移状态**：已提取 `getSiblings<T>(items: T[], currentSlug: string)` 通用工具函数，统一在 `app/content/utils.ts` 中定义。

建议：提取 `getSiblings<T>(items: T[], currentSlug: string)` 工具函数。

**7. ExerciseService 直接访问 topicRepository**

`ExerciseService` 绕过 `TopicService` 直接使用 `topicRepository` 获取主题标题。虽然注释说明了避免循环依赖的原因，但如果 `TopicService` 后续增加缓存或鉴权逻辑，此处会被绕过。

建议：考虑通过依赖注入或事件机制解耦，或在 `TopicService` 上暴露 `getTopicTitle(slug)` 轻量方法。

**8. domains/index.get.ts 静默降级**

请求 `?slug=nonexistent` 时，handler 不返回 404 而是静默回退到默认领域。这可能掩盖数据问题。

> **V2 迁移状态**：已修复。当指定 slug 但未找到时返回 404；无参数时返回全部领域列表。

建议：如果 slug 明确指定但未找到，应返回 404；仅在无参数时回退到默认领域。

**9. ExerciseRepository.getOneByTopic 全量查询后取首条**

调用 `listByTopic()` 获取主题下全部练习，再取 `list[0]`。数据量增长后可能成为性能瓶颈。

建议：在查询中添加 `.limit(1)`。

**10. Header.vue 无障碍属性缺失**

汉堡菜单按钮缺少 `aria-expanded`；两个 `<nav>` 元素未用 `aria-label` 区分；移动端菜单未做焦点捕获。

**11. Footer.vue 残留无用 CSS**

`.app-footer__links`、`.app-footer__group-title`、`.app-footer__link` 三个类在模板中从未使用，`space-between` 布局在单子元素下无效。

---

### 三、低优先级问题

**12. API 层查询参数提取重复**

`typeof query.X === 'string' ? query.X : undefined` 模式在 4 个文件中重复出现。可提取 `getStringQueryParam(event, name)` 工具函数。

**13. normalizeSlug 不校验格式**

仅去除首尾空白，不做小写化、特殊字符过滤或长度限制。恶意或畸形 slug 会直达数据库查询。

**14. Repository 内部成员暴露**

`_explicitDb`、`table`、`_getDb()` 均为 public，应改为 private/protected。

**15. Renderer.vue 占位 computed**

`frontmatter`、`toc`、`readingTime` 始终返回空值但暴露给 slot，属于死代码。

**16. DomainRepository.getDefault 硬编码 slug**

`'algebra'` 作为默认领域 slug 硬编码在仓储层，属于业务逻辑，应上移到 Service 层。

**17. CTASection.vue 装饰元素缺少 aria-hidden**

`∑` 符号装饰 div 未设置 `aria-hidden="true"`，屏幕阅读器会朗读。

---

### 四、已确认无问题的方面

- **SQL 注入**：全部查询使用 Drizzle 参数化构建，无字符串拼接
- **数据库索引**：schema 中所有 slug 列、排序列、外键列均已建索引
- **N+1 查询**：关联查询均使用 Drizzle `with` 子句做 eager loading
- **架构合规**：API 层 100% 仅调用 Service 层，无直接跨层访问仓储
- **组件 CSS 隔离**：全部使用 `<style scoped>`，BEM 命名一致
- **NuxtLink 使用**：`:key` 绑定正确，路由跳转规范

---

### 五、建议修复顺序

1. Renderer.vue Props 类型化（影响最大，涉及整个内容渲染链路）
2. Service 层对象展开改为显式字段选取（消除类型安全隐患）
3. Repository 基类提取（消除 90 行重复，为后续错误处理打基础）
4. 导航逻辑提取工具函数
5. Renderer.vue 异步渲染竞态修复
6. 其余中低优先级问题按迭代节奏逐步处理
