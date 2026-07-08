# Markdown Engine Design Document

Version: 1.0

Status: Draft

Owner: DeXin Labs


---

# 1. Overview


Markdown Engine 是德鑫实验室内容系统的核心渲染基础设施。


它的目标不是简单显示 Markdown 文本，而是建立一个：

- 可扩展
- 可测试
- 可长期演进

的内容处理引擎。


设计目标：


Markdown

↓

Structured Content

↓

Interactive Learning Content



最终服务于：

- 课程内容
- 学习笔记
- 数学公式
- 代码示例
- 图表
- 互动组件



---

# 2. Design Motivation


## 2.1 为什么不直接使用框架内置 Markdown


早期可以使用：

- Nuxt Content
- markdown-it
- remark


但是长期存在问题：

- 内容结构受框架限制
- 插件扩展受限制
- 无法加入教育领域特性
- 难以迁移


因此：

Markdown Engine 独立维护。


---

# 3. Core Design Principles


## 3.1 Separation of Concerns


系统分离：


Content

负责：

内容在哪里

Markdown Engine

负责：

内容如何转换

UI

负责：

内容如何展示



例如：

课程章节：


Course Module

|
|
↓

Content Engine

|
|
↓

Markdown Engine

|
|
↓

Vue Component




---

## 3.2 Pipeline Architecture


采用流水线设计。



Input

Markdown

↓

Parser

↓

AST

↓

Transformer

↓

Plugin

↓

Renderer

↓

Output



每个阶段职责单一。


---

# 4. Why AST


AST 是整个 Engine 的核心。


不用直接：


Markdown

↓

HTML



原因：


HTML 是展示层。


教育内容需要：

- 知识节点
- 公式节点
- 示例节点
- 提示节点
- 练习节点


例如：


Markdown:

```md
:::

x²+y²

:::



转换：

{
"type":"example",

"children":[

]

}


之后：

不同 Renderer 可以产生不同表现。

5. AST as Internal Contract

AST 是 Engine 内部协议。

所有能力围绕 AST。

例如：


Math Plugin

↓

Math Node


Code Plugin

↓

Code Node


Exercise Plugin

↓

Exercise Node



未来新增功能：

不是修改 Renderer。

而是：

新增 Node 类型。

6. Plugin Architecture

采用插件化设计。

核心：


Engine Core

      +

Plugins



Core 负责：

Pipeline
AST
生命周期

Plugin负责：

特殊语法
AST转换
输出扩展
7. Plugin Lifecycle

Register

↓

Parse

↓

Transform

↓

Render



例如数学插件：

输入：

$x^2$


生成：

MathNode



Renderer：

MathNode

↓

KaTeX HTML


8. Renderer Design

Renderer 与 Parser 分离。

原因：

同一份内容可以：

输出 HTML：

Browser


输出 Vue：

Interactive Page


输出 JSON：

Search Index


因此：


AST

↓

Renderer Adapter


9. Education Domain Extension

普通 Markdown Engine：

目标：

显示文章。

本项目：

目标：

教育内容。

因此未来支持：

Knowledge Node

例如：

{
type:"concept",

name:"一次函数"

}

Exercise Node

例如：

{
type:"exercise",

question:"..."

}

Reference Node

例如：

{
type:"reference",

target:"chapter-1"

}

10. Relationship With Content Engine

两个 Engine 分离。

Content Engine:

负责：


Database

Filesystem

CMS

Metadata



Markdown Engine:

负责：


Markdown

AST

Rendering



关系：


Content Engine

       |

       ↓

Markdown Engine



反方向禁止。

11. Technology Decision
Parser

当前允许：

markdown-it
remark
micromark

Parser 可以替换。

原因：

Parser 不是公共接口。

AST

AST 是稳定接口。

任何 Parser 必须转换成：

Internal AST

Renderer

Renderer 可以多个：


HTML Renderer

Vue Renderer

JSON Renderer


12. Testing Strategy

测试重点不是代码。

而是行为。

采用：

Fixtures

输入：


example.md


Snapshot

输出：


example.ast.json



确保：

重构不会改变行为。

13. Future Evolution

未来版本：

V1

Markdown Rendering

支持：

标题
列表
数学公式
代码
V2

Educational Markdown

增加：

Concept Node
Exercise Node
Knowledge Link
V3

Learning Content Engine

支持：

Knowledge Graph
Recommendation
AI Analysis
14. Design Constraints

必须保持：

Markdown Engine 独立。

业务代码不知道内部实现。

AST 是核心协议。

新增能力优先 Plugin 化。

重大变化必须 RFC。

15. Final Statement

Markdown Engine 不是 Markdown 渲染组件。

它是：

教育内容平台的基础内容处理引擎。

设计目标：

让内容可以被解析、理解、扩展，并最终支持智能学习系统。