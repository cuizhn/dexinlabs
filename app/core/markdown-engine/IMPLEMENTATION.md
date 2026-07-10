# Markdown Engine 架构升级指令（Implementer）

## 本次架构调整

Markdown Engine 将进行一次架构升级，以提高长期可维护性、可扩展性和跨平台能力。

本次升级属于架构重构，不是功能开发。

所有实现必须遵循以下四项设计决策。

---

# Decision 1：增加 Compiler 层

现有流程：

Markdown

↓

Parser

↓

AST

↓

Transformer

↓

Renderer

升级后：

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

Vue / HTML / JSON

## 原因

Renderer 不应直接理解业务节点。

Compiler 负责：

* 将 Internal AST 编译为 Render Tree
* 屏蔽业务节点细节
* 为不同 Renderer 提供统一输入

这样：

* Vue Renderer
* HTML Renderer
* JSON Renderer
* React Renderer

均共享同一套编译结果。

禁止：

Renderer 直接遍历 AST。

---

# Decision 2：Plugin 不参与渲染

Plugin 的职责调整为：

允许：

* Parser Extension
* AST Transform
* Node Registration

禁止：

* 输出 HTML
* 输出 Vue
* 输出 Render Tree
* 注册 Renderer

例如：

Math Plugin

负责：

Markdown

↓

MathNode

结束。

Renderer 如何显示 MathNode，由 Renderer Adapter 决定。

Plugin 必须保持与 UI 框架无关。

---

# Decision 3：建立 Internal AST

Engine 不允许直接使用任何 Parser 的 AST。

例如：

remark

↓

remark AST

↓

AST Adapter

↓

Internal AST

↓

Engine

或：

markdown-it

↓

Token

↓

AST Adapter

↓

Internal AST

↓

Engine

Engine 内所有模块只能操作 Internal AST。

禁止：

Engine 依赖：

* mdast
* markdown-it Token
* micromark Node

这样可以保证 Parser 可替换，而不会影响后续模块。

---

# Decision 4：Renderer 输出 Render Tree

Renderer 不直接生成 Vue Component。

正确流程：

Internal AST

↓

Compiler

↓

Render Tree

↓

Vue Adapter

↓

Vue Components

或：

Render Tree

↓

HTML Adapter

↓

HTML

Render Tree 是平台无关的数据结构。

例如：

{
"type": "Heading",
"level": 2,
"children": [
{
"type": "Text",
"value": "一元二次方程"
}
]
}

Vue Adapter 负责：

Render Tree

↓

VNode

HTML Adapter 负责：

Render Tree

↓

HTML

JSON Adapter 负责：

Render Tree

↓

JSON

任何 Renderer Adapter 不允许重新解析 Markdown。

---

# 新的整体 Pipeline

Markdown

↓

Parser

↓

Parser AST

↓

AST Adapter

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

Output

其中：

Parser AST

属于 Parser 内部实现。

Internal AST

属于 Markdown Engine 核心协议。

Render Tree

属于跨平台渲染协议。

---

# 实施要求

本次开发过程中：

1. 新增 Compiler 模块。

2. 建立 AST Adapter。

3. 定义 Internal AST。

4. 定义 Render Tree。

5. 修改 Plugin，仅负责解析和 AST 转换。

6. 修改 Renderer，仅消费 Render Tree。

7. Vue、HTML 等平台实现 Adapter，不直接依赖 Internal AST。

禁止：

* Plugin 输出 HTML。
* Plugin 输出 Vue Component。
* Renderer 遍历 Parser AST。
* Engine 内引用 Parser 专有数据结构。
* 业务代码依赖 Engine 内部实现。

---

# 最终目标

Markdown Engine 必须成为一个独立的、平台无关的内容处理引擎。

其公共职责为：

Markdown

↓

Internal AST

↓

Render Tree

↓

Platform Adapter

未来无论替换 Parser、增加新平台（React、PDF、CLI 等），均无需修改业务模块和公共 API。
