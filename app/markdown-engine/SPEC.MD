
# markdown-engine/SPEC.md

# Markdown Engine Specification


Version:

1.0


Status:

Draft



# 1. Purpose


Markdown Engine provides a unified Markdown processing pipeline.


Input:

Markdown


Output:

Rendered Content


Pipeline:


```

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

````



---

# 2. Responsibility


Markdown Engine负责：


## Parsing

将 Markdown 转换为内部结构。


## AST

维护统一内容结构。


## Plugin

提供扩展能力。


## Rendering

生成最终输出。


---

# 3. Non Responsibility


Markdown Engine 不负责：


数据库

用户

课程

权限

搜索

学习进度

页面路由


---

# 4. Public API


外部只能使用：

```js
createEngine()

render()

parse()

compile()

registerPlugin()

````

例如：

```js
const engine = createEngine({
 plugins:[
   mathPlugin
 ]
})


const result =
 await engine.render(markdown)

```

---

# 5. Internal Architecture

```

src/

├── parser

负责解析


├── ast

内部节点定义


├── transformer

AST转换


├── plugins

扩展能力


├── renderer

输出


├── pipeline

流程控制


└── index

public API


```

---

# 6. Plugin System

插件必须独立。

格式：

```js
{
 name,
 version,

 transform(ast){

 }

}

```

插件不能：

* 修改核心代码
* 依赖业务模块

---

# 7. AST Specification

AST 是 Engine 内部契约。

例如：

```js
{
 type:"document",

 children:[
   {
     type:"heading",
     depth:2,
     children:[]
   }
 ]

}

```

所有转换必须围绕 AST。
 AST 基础节点类型（如 root, paragraph, heading, code）遵循 MDAST (Markdown Abstract Syntax Tree) 规范。自定义教育节点（如 exercise, concept）在此规范上扩展。

---

# 8. Renderer

Renderer负责：

AST

↓

Output

支持：

HTML

Vue Node

Component Tree

Renderer不能：

访问数据库

读取课程数据

---

# 9. Testing

必须包含：

fixtures

snapshots

unit tests

例如：

```

fixtures/

math.md

table.md

code.md


snapshots/

math.json

```

---

# 10. Versioning

重大变化必须：

创建 RFC

例如：

RFC-001

AST v2

RFC 内容：

* Problem
* Proposal
* Migration

---

# 11. Evolution

未来支持：

Math

Code Highlight

Diagram

Interactive Component

Reference

Footnote

新增能力优先通过 Plugin。

---

# 12. Implementer Rules

执行者必须：

阅读：

ARCHITECTURE.md

SPEC.md

然后实现。

禁止：

直接创建页面组件

直接绑定 Nuxt

直接绑定数据库

目标：

构建一个独立 Markdown Engine。

```

---

下一步建议再补第三个文件：

```

markdown-engine/DESIGN.md

```

它负责回答：

**“为什么这样设计，以及 Parser、AST、Plugin、Renderer 的详细设计决策。”**

这样三个文件形成：

```

ARCHITECTURE.md   （全局规则）
|
|
DESIGN.md         （设计思想）
|
|
SPEC.md           （实现契约）

```

这会更适合长期让 AI 协作开发。
```
