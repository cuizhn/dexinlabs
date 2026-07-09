# Markdown Engine Migration Guide

Version: 2.0

Status: Active

Type: Replacement Migration

Priority: Highest

---

# 1. Purpose

本项目已决定采用独立维护的 Markdown Engine。

此次迁移属于 **Replacement Migration（替换式迁移）**。

目标不是兼容旧渲染系统，而是完全替换。

迁移完成后：

- 项目中仅保留一套 Markdown 渲染体系。
- 所有 Markdown 能力统一由 Markdown Engine 提供。
- App 层不再维护任何 Markdown 解析逻辑。

---

# 2. Migration Goal

旧架构：

Page
↓

MarkdownRenderer.vue
↓

Markdown Parser
↓

Plugin
↓

HTML
↓

Vue

新架构：

Page
↓

Markdown.vue（Adapter）
↓

Markdown Engine
↓

Parser
↓

Internal AST
↓

Transformer
↓

Compiler
↓

Render Tree
↓

Vue Adapter
↓

Vue

---

# 3. Official Architecture

Markdown Engine 成为唯一官方 Markdown 引擎。

所有 Markdown 功能必须进入：

markdown-engine/

禁止：

- app/components 内实现解析逻辑
- modules 内实现 Markdown Parser
- composables 内实现 Markdown 转换
- utils 内维护独立 Markdown 工具

---

# 4. Remove Legacy Implementation

以下内容属于 Legacy Implementation。

迁移完成后必须删除。

包括但不限于：

- 旧 MarkdownRenderer
- markdown-it 封装
- parser utils
- plugin registry
- render utils
- AST utils（旧）
- Markdown composables
- Markdown services

如果旧实现仍被引用，应迁移至 Markdown Engine 后删除。

---

# 5. New Responsibilities

Markdown Engine：

负责：

- Parser
- Internal AST
- Transformer
- Plugin System
- Compiler
- Renderer
- Public API

App：

负责：

- 页面布局
- Vue 组件展示
- 用户交互

Content Engine：

负责：

- 内容查询
- 内容存储
- Metadata
- Cache

---

# 6. Markdown.vue

项目仍保留：

app/components/markdown/Markdown.vue

但它仅作为：

Vue Adapter。

职责：

- 调用 Markdown Engine
- 接收 Render Tree
- 渲染 Vue Components

禁止：

- Markdown Parsing
- Plugin Registration
- AST Processing
- HTML Rendering Logic

Markdown.vue 不属于 Markdown Engine。

---

# 7. Dependency Rules

正确：

Page
↓

Markdown.vue
↓

Markdown Engine

错误：

Page
↓

markdown-it

错误：

Page
↓

remark

错误：

Page
↓

rehype

错误：

Module
↓

Markdown Parser

错误：

Markdown Engine
↓

Course Module

依赖必须保持单向。

---

# 8. Migration Steps

Stage 1

建立：

markdown-engine/

实现：

- Public API
- Parser
- Internal AST

Stage 2

实现：

- Plugin System
- Compiler
- Renderer

Stage 3

创建：

Markdown.vue

作为唯一 Adapter。

Stage 4

所有页面改为：

Markdown.vue

↓

Markdown Engine

Stage 5

删除：

所有旧 Markdown 实现。

Stage 6

运行全部测试。

确认：

项目不存在 Legacy Markdown Code。

---

# 9. Migration Checklist

迁移完成时必须满足：

☐ 所有页面使用 Markdown.vue

☐ 所有解析来自 Markdown Engine

☐ 不存在 markdown-it 直接调用

☐ 不存在 remark 直接调用

☐ 不存在旧 Parser

☐ 不存在旧 Plugin Registry

☐ 不存在重复 Renderer

☐ 所有 Markdown 插件迁移完成

☐ 所有测试通过

---

# 10. Definition of Done

迁移完成后：

项目中只存在一套 Markdown Pipeline。

Markdown
↓

Parser
↓

Internal AST
↓

Transformer
↓

Compiler
↓

Render Tree
↓

Renderer Adapter
↓

Vue

任何新的 Markdown 功能必须通过：

Plugin

↓

Engine API

↓

Markdown.vue

进行扩展。

禁止再次创建新的 Markdown 渲染系统。

---

# 11. Implementer Instructions

执行任何 Markdown 相关任务前：

必须阅读：

- ARCHITECTURE.md
- DESIGN.md
- SPEC.md
- MIGRATION.md

实现过程中：

优先保证：

1. 单一渲染体系
2. 清晰架构边界
3. Engine 独立维护
4. API 稳定
5. 可测试

禁止：

- 保留重复实现
- 引入第二套 Markdown Pipeline
- 在业务层实现解析逻辑

Markdown Engine 是项目唯一官方 Markdown 引擎。