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

> 状态标注：✅ = 已完成；🔄 = 进行中；🔮 = 未来计划

Stage 1 ✅ 已完成（2026-07-09，独立 Engine 骨架落地）

建立：

markdown-engine/

实现：

- Public API（createEngine / getEngine / parse / render / compile / registerPlugin / run / 便捷函数）
- Parser（marked.lexer + MDAST 兼容 AST 转换器）
- Internal AST（ast/types.ts 单一真源，17+ 节点类型 + Transformer/Renderer 契约）

Stage 2 ✅ 已完成（2026-07-09，插件系统与双 Renderer 落地）

实现：

- Plugin System（自管 Map-based Registry，与 @core/registry 解耦）
- Compiler（compile() = 一次返回 html + vnode + ast + enhancedAST + errors）
- Renderer（HTML：marked.parse 委托 + slug 一致性；VNode：递归 AST → JSON 描述树）

Stage 3 ✅ 已完成（2026-07-09，唯一 Vue Adapter 创建）

创建：

Markdown.vue（路径：app/components/markdown/Markdown.vue）

作为唯一 Adapter。

Stage 4 ✅ 已完成（2026-07-09，全量页面切换）

所有页面（3/3）改为：

Markdown.vue

↓

Markdown Engine

Stage 5 ✅ 已完成（2026-07-09，旧实现删除）

删除：

所有旧 Markdown 实现（旧 MarkdownRenderer.vue / app/render/parsers/* / app/render/transformers/* 共 10 文件清理）

Stage 6 🔄 进行中（2026-07-09，测试与回归验证）

运行全部测试。

确认：

项目不存在 Legacy Markdown Code。

---

# 9. Migration Checklist

迁移完成时必须满足：

☑ 所有页面使用 Markdown.vue（study / course lesson / exercise chapter 3/3 页面已切换）

☑ 所有解析来自 Markdown Engine（唯一 Vue Adapter Markdown.vue 内部调用 @me getEngine().run()，无第二条解析路径）

☑ 不存在 markdown-it 直接调用（全局 grep 无 import markdown-it；study.vue Line 25 误导注释已修正为独立 Markdown Engine + marked.lexer）

☑ 不存在 remark 直接调用

☑ 不存在旧 Parser（app/render/parsers/ 目录与 3 个旧 parser 文件已清理）

☑ 不存在旧 Plugin Registry（Engine 自管 Map-based Registry，不依赖 app 层旧 plugin registry 实现）

☑ 不存在重复 Renderer（旧 app/render/theme/MarkdownRenderer.vue 已删除，仅保留新 app/components/markdown/Markdown.vue）

☑ 所有 Markdown 插件迁移完成（heading/toc/links/excerpt/readingTime/reference 6 内置插件全量迁入 Engine，内置 order 常量保持一致）

☑ 所有测试通过（15 Engine Tests 全绿；Build/Sync 三绿待 Phase F 最后确认）

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