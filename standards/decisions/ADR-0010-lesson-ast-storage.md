# ADR-0010 Lesson AST 作为课程唯一存储格式

## Status

Proposed

---

## Date

2026-08-05

---

## Context

当前数据库以 Markdown 字段（body、intro、summaryText、objectives、notes）存储课时内容。这导致：

1. **输入方式受限**：数据库绑定 Markdown 格式，无法支持可视化编辑器、AI 生成、Word 导入等多元输入
2. **结构信息丢失**：Markdown 是线性文本，无法表达"定义"、"示例"、"练习题"等教学语义
3. **渲染耦合**：Service 层需要知道哪些字段是 Markdown 并逐一渲染，新增字段需修改 Service
4. **多端输出困难**：PDF 导出、移动端展示需要重新解析 Markdown，无法复用结构化数据

---

## Decision

**采用 Lesson AST（JSON）作为课程的唯一存储格式。**

数据库以 JSONB 列存储 Lesson AST，所有输入方式（Markdown、可视化编辑器、AI 等）先通过 Content Compiler 转换为 AST，再存入数据库。所有消费方（API、Renderer、PDF 导出等）从 AST 读取。

核心规则：

1. **Content Compiler 是唯一入口**：只有它可以将外部内容转换为 AST
2. **Repository 只读写 AST**：不做任何解析或渲染
3. **Service 不编译 Markdown**：只负责业务逻辑和数据组装
4. **Renderer 按 Block 类型分发**：每个 Block 对应一个 Vue 组件
5. **Markdown Engine 收窄为 Block 级**：只负责文本块内的行内 Markdown → HTML

---

## Alternatives Considered

### 方案 A：保持 Markdown 存储（当前方案）

**未采用原因**：绑定单一输入格式，无法支持多元输入和结构化输出。

### 方案 B：HTML 存储

**未采用原因**：HTML 是渲染格式，丢失教学语义（无法区分"定义"和"示例"），不利于编辑和多端输出。

### 方案 C：Markdown + AST 双存储

**未采用原因**：数据冗余，需要维护一致性，违反"唯一数据源"原则。

---

## Consequences

### 优点

- 输入方式可自由扩展（Markdown、编辑器、AI、Word 等）
- 教学语义结构化（定义、示例、练习题等 Block 类型）
- 多端输出（Web、PDF、移动端）共享同一份数据
- Service 层简化，不再负责 Markdown 渲染
- 版本号机制支持未来 AST 结构演进

### 缺点

- 需要一次性迁移现有 Markdown 数据
- AST 设计需要提前规划 Block 类型
- 调试 JSONB 数据不如纯文本直观

### 需要注意

- 过渡期保留旧 Markdown 字段，逐步迁移
- Content Compiler 的 Markdown 解析需要覆盖现有所有内容格式
- Block 类型系统需要随业务演进，但变更需通过版本号管理

---

## Related Documents

- [LESSON_AST](./LESSON_AST.md) — Lesson AST 设计规范
- [ADR-0009](./ADR-0009-content-rendering-responsibility.md) — 被本规范取代
- [01-Architecture](../handbook/01-ARCHITECTURE.md) — 模块职责定义
