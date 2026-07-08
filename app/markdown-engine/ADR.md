# Markdown Engine 独立维护规范

## 项目定位

Markdown Engine 是本系统中的独立基础设施层（Infrastructure Layer）。

它负责：

* Markdown 文档解析
* AST 构建
* 内容转换
* 插件扩展
* 渲染输出

它不负责：

* 课程业务逻辑
* 用户系统
* 数据库查询
* 内容管理
* 页面路由
* Nuxt 生命周期

## 架构原则

Markdown Engine 必须与业务模块完全解耦。

禁止：

* Markdown Engine 引入 Course Module
* Markdown Engine 引入 Content Engine
* Markdown Engine 依赖 Nuxt API
* Markdown Engine 依赖 Vue Component
* Markdown Engine 直接访问数据库

允许：

* Content Engine 调用 Markdown Engine
* Course Module 使用 Markdown Engine 输出结果
* Vue Renderer 作为 Markdown Engine 的适配层

## 依赖方向

正确：

Content Engine
|
↓
Markdown Engine
|
↓
Renderer Adapter

错误：

Markdown Engine
|
↓
Course Module

Markdown Engine
|
↓
Nuxt Pages

## 目录要求

Markdown Engine 必须拥有独立目录：

markdown-engine/

包含：

* DESIGN.md
* ARCHITECTURE.md
* SPEC.md
* RFC/
* VERSION.md
* src/
* tests/
* fixtures/

## API 设计要求

Markdown Engine 必须通过稳定 API 对外提供能力。

例如：

* createEngine()
* render()
* parse()
* registerPlugin()

外部调用者不应该知道内部实现。

禁止业务代码直接调用：

* parser 内部函数
* plugin 内部函数
* AST transform 内部函数

// ✅ 允许的公共 API
export interface IMarkdownEngine {
  createEngine(options: EngineConfig): Engine;
  render(markdown: string): RenderedOutput;
  parse(markdown: string): AST;
  registerPlugin(plugin: Plugin): void;
}

// ❌ 禁止暴露的内部 API
// 不要导出 _parseInternalAST(), _transformAST() 等

## 演进要求

Markdown Engine 需要支持长期演进。

未来可能替换：

* markdown parser
* AST 标准
* renderer
* plugin system

但不能影响：

* Content Engine
* Course Module
* 页面组件

## 当前实现目标

第一阶段：

实现稳定 Markdown Pipeline：

Markdown
↓
Parser
↓
AST
↓
Plugin
↓
Renderer

第二阶段：

增加：

* 数学公式
* 代码高亮
* 提示块
* 图片处理
* 引用系统
* 内容组件

第三阶段：

形成独立 Markdown Engine Library。

## 实施原则

执行者必须优先保证：

1. 架构边界正确
2. API 稳定
3. 可测试
4. 可扩展

不要为了快速实现，把代码直接写入业务模块。
