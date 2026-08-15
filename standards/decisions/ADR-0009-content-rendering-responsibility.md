# ADR-0009 Content Rendering Responsibility

## Status

Superseded（被 standards/LESSON_AST.md 与 ADR-0013 取代，2026-08-15）

> 本 ADR 关于"Service 层负责 Markdown → HTML"的决策已被 **LESSON_AST.md** 取代。
> 当前架构：**Content Compiler（`tools/content-compiler/`）在编译期将内容转为 Lesson AST（Inline[] 语义）**，
> 运行时不再做 Markdown 渲染，Service 只组装 Lesson AST，Renderer 按 Block 类型分发到 Vue 组件。
> 详见 ADR-0013（编译/存储/预览）与 ADR-0010（AST 存储）。

---

## Date

2026-08-04

---

## Context

项目中有两类内容需要 Markdown → HTML 转换：

- **Lesson**：intro、body、summaryText
- **Exercise**：body、description、hint、answer、analysis

在早期实现中，Lesson 的渲染在 Service 层完成（`LessonService.getLessonPage` 调用 `renderToHTML`），而 Exercise 的渲染却在 Composable 层完成（`useExercisePage` 直接导入 `@markdown` 的 `renderToHTML`）。

这导致：

- 渲染职责分散在两个不同的层；
- Composable 承担了不属于它的职责（内容转换）；
- 未来新增内容类型时，渲染位置无统一标准可循。

---

## Decision

**所有内容转换（Markdown → HTML）必须在 Service 层完成。**

具体规则：

1. **Service 层**（Content Engine）负责调用 `@markdown` 的 `renderToHTML`，将 Markdown 字段渲染为 HTML 字段（如 `bodyHtml`、`introHtml`）。

2. **Composable 层**只负责状态管理（API 调用、Loading、Error、Cache），不导入 `@markdown`，不执行任何内容转换。

3. **Page / Component 层**只消费已渲染的 HTML，不感知 Markdown 的存在。

调用链：

```
Service（渲染 Markdown → HTML）
  ↓
API（透传）
  ↓
Composable（状态管理）
  ↓
Page / Renderer（展示 HTML）
```

---

## Alternatives Considered

### 方案 A：Composable 层渲染（旧方案）

在 `useExercisePage` 中直接调用 `renderToHTML`。

**未采用原因**：

- 违反架构分层原则（Composable 职责是状态管理，不是内容转换）；
- 与 LessonService 的做法不一致；
- 客户端渲染增加首屏耗时。

### 方案 B：Page 层渲染

在 Vue 组件中直接调用 Markdown 引擎。

**未采用原因**：

- 严重违反 Renderer 纯展示原则；
- 页面组件耦合 Markdown 实现细节。

### 方案 C：独立 Rendering Middleware

在 API 和 Composable 之间增加一层专门做渲染。

**未采用原因**：

- 过度设计，增加无意义的中间层；
- 渲染本质上是业务逻辑的一部分，属于 Service 职责。

---

## Consequences

### 优点

- 渲染职责统一在 Service 层，所有类型的内容转换遵循同一模式；
- Composable 保持轻量，只关注状态管理；
- 服务端渲染（SSR）性能更优；
- 未来新增内容类型（如 Article）时，有明确的实现模式。

### 缺点

- Service 层需要感知哪些字段需要渲染（但这本身是业务逻辑的一部分）；
- 返回数据量略增（包含 HTML 字段）。

### 需要注意

- Service 渲染后，原始 Markdown 字段仍保留在返回结构中（供编辑等场景使用）；
- 新增内容类型时，应在 Service 的 `getXxxPage` 方法中完成渲染，而非在 Composable 中。

---

## Related Documents

- [01-Architecture](../handbook/01-ARCHITECTURE.md) — 模块职责定义
- [02-Development Rules](../handbook/02-development-rules.md) — 分层原则
- [ADR-0003](./ADR-0003-content-markdown-separation.md) — Content Engine 与 Markdown Engine 分离
- [ADR-0004](./ADR-0004-renderer-display-only.md) — Renderer 仅负责展示
