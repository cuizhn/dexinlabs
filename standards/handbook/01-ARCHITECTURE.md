# 得心实验室 · Project Architecture

> Version: V2
> Status: Active

---

# 1. Philosophy

得心实验室遵循以下原则：

- 成熟生态优先
- 业务优先
- 避免无意义抽象
- 高内聚、低耦合
- 每种能力只有唯一负责人

项目维护的是教育业务，而不是基础设施。

---

# 2. Design Principles

## 2.1 Mature Solutions First

优先采用成熟生态：

| 能力 | 方案 |
|------|------|
| Markdown | remark + unified |
| Math | KaTeX |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Server | Nuxt / H3 |

不重复实现 Parser、Lexer、ORM 等基础能力。

---

## 2.2 Business Only

项目只维护业务：

- 课程
- 学习
- 练习
- 权限
- 学习记录

基础设施交给社区生态。

---

## 2.3 Single Responsibility

每种能力只有一个负责模块。

| 能力 | 模块 |
|------|------|
| Markdown | app/markdown |
| Content | app/content |
| Database | app/database |

不得重复实现。

---

## 2.4 Engine

Engine 是协调者。

负责：

- 配置
- 组合
- Plugin
- 统一 API

不负责：

- Parser
- Lexer
- ORM
- Storage

Engine 不保存业务状态。

---

## 2.5 Thin Layers

任何只做参数透传的层都应该删除。

例如：

Repository → Mapper → DTO

没有业务价值。

---

# 3. Module Responsibilities

## Page

负责：

- 页面展示
- 调用 Composable

禁止：

- SQL
- Markdown
- Repository

---

## Composable

负责：

- API 调用
- Cache
- Loading
- Error

---

## API

负责：

- 参数校验
- 调用 Service
- 返回 Response

禁止：

- Repository
- 业务逻辑

---

## Service

负责：

- 业务逻辑
- 数据组合
- 导航
- 权限
- 学习流程

允许组合多个 Repository。

原则上不互调 Service。

---

## Repository

负责：

CRUD。

禁止：

- Markdown
- Vue
- Service
- API

---

## Markdown

负责：

- Processor
- Plugin
- render()
- parse()

禁止：

- Repository
- Service
- Database

---

## Database

负责：

- Schema
- Migration
- Connection

---

# 4. Dependency Rules

允许：

Page
↓

Composable
↓

API
↓

Service
↓

Repository
↓

Database

Markdown 为独立模块。

任何业务层可以调用 Markdown。

Markdown 不允许依赖业务模块。

---

# 5. Call Flow

Lesson Page

Page

↓

Composable

↓

API

↓

Service

↓

Repository

↓

Database

↓

Response

---

# 6. Architecture Evolution

只有以下情况允许修改架构：

- 新业务无法实现
- 模块职责发生变化
- 大量重复代码
- 性能瓶颈
- 技术栈升级

不得为了"更优雅"而重构。

---

# 7. One Sentence

业务自己实现。

基础能力交给成熟生态。

保持职责单一，依赖清晰。

UI 使用 Vue SFC；组件样式默认采用 scoped CSS；全局样式仅负责基础环境和设计 Tokens。