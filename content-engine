我认为这是一个非常好的时机。

根据这几天我们讨论的所有内容，我不会设计一个"Nuxt Content 的替代品"，而是设计一个**教育平台专用 Content Engine**。

设计目标只有一句话：

> **任何技术（Content v3、Markdown、数据库、CMS）都只是 Content Engine 的一个数据源（Source），而不是整个系统。**

---

# Content Engine

```
App
 │
 │ useCourse()
 ▼
Content Engine
 │
 ├───────────────┐
 │               │
 ▼               ▼
Source        Renderer
 │               │
 ▼               ▼
Markdown      Vue Component
Database
CMS
```

整个 Engine 分为六层。

```
Source
↓

Loader

↓

Parser

↓

Transformer

↓

Renderer

↓

Query
```

每层只有一个职责。

---

# 目录结构

```
modules/
└── content/
    │
    ├── core/
    │   ├── engine.ts
    │   ├── registry.ts
    │   └── pipeline.ts
    │
    ├── source/
    │   ├── markdown/
    │   ├── database/
    │   ├── cms/
    │   └── index.ts
    │
    ├── loader/
    │   ├── course.ts
    │   ├── chapter.ts
    │   ├── lesson.ts
    │   └── asset.ts
    │
    ├── parser/
    │   ├── markdown.ts
    │   ├── frontmatter.ts
    │   ├── math.ts
    │   └── plugins/
    │
    ├── transformer/
    │   ├── toc.ts
    │   ├── heading.ts
    │   ├── links.ts
    │   ├── reference.ts
    │   ├── excerpt.ts
    │   └── readingTime.ts
    │
    ├── renderer/
    │   ├── MarkdownRenderer.vue
    │   ├── components/
    │   └── theme/
    │
    ├── query/
    │   ├── content.ts
    │   ├── course.ts
    │   ├── chapter.ts
    │   └── lesson.ts
    │
    ├── cache/
    │
    ├── schema/
    │
    ├── types/
    │
    ├── utils/
    │
    ├── DESIGN.md
    ├── SPEC.md
    ├── RFC/
    └── IMPLEMENTATION.md
```

---

# 第一层：Core

整个 Engine 的核心。

```
engine.ts
```

负责：

```
Source

↓

Parser

↓

Transformer

↓

Renderer
```

全部串起来。

任何地方都不要直接调用 Parser。

只能：

```
Engine
```

统一调用。

---

```
registry.ts
```

负责：

```
Plugin

Transformer

Renderer

Adapter
```

全部注册。

以后新增插件：

```
Math

Diagram

Mermaid

Alert

Reference
```

无需修改 Engine。

---

```
pipeline.ts
```

负责整个流程。

```
Load

↓

Parse

↓

Transform

↓

Render
```

以后所有步骤都是 Pipeline。

---

# 第二层：Source

这里只有一个职责。

**获取内容。**

可以来自：

```
Markdown
```

或者：

```
Database
```

或者：

```
Strapi
```

或者：

```
API
```

Engine 根本不知道来源。

例如：

```
source.getLesson()
```

返回统一对象。

---

# 第三层：Loader

这一层很多人都会忽略。

实际上 Loader 不属于 Source。

例如：

```
Course
```

需要：

```
Course

↓

Edition

↓

Chapter

↓

Lesson
```

Loader 负责组装。

例如：

```
loadCourse()
```

最后返回：

```
Course Tree
```

Source 不负责这些。

---

# 第四层：Parser

这里只做解析。

```
Markdown

↓

AST
```

或者：

```
Markdown

↓

HTML AST
```

不要：

* 查询数据库

不要：

* Vue

不要：

* TOC

不要：

* Reading Time

Parser 只有解析。

---

# 第五层：Transformer

这是整个系统以后最重要的一层。

Parser 输出：

```
AST
```

Transformer：

```
AST

↓

Heading ID

↓

TOC

↓

Reference

↓

Math

↓

Custom Block

↓

Reading Time

↓

Excerpt

↓

Link

↓

Metadata
```

以后任何增强：

全部写这里。

不会污染 Parser。

---

# 第六层：Renderer

这里只有：

```
AST

↓

Vue
```

Renderer 不解析 Markdown。

Renderer 不查询数据库。

Renderer 只渲染。

例如：

```
Heading

Paragraph

Image

Math

Code

Table
```

全部组件化。

---

# Query

这是给业务调用的。

例如：

```
getCourse()

getChapter()

getLesson()
```

以后：

页面：

```
CoursePage
```

永远：

```
Query

↓

Engine
```

不会直接碰 Source。

---

# Schema

以后数据库。

Markdown。

API。

全部统一。

例如：

```
Lesson
```

永远：

```
id

slug

title

summary

content

order
```

无论：

Markdown

还是：

Database

返回都一样。

---

# Types

统一：

```
ContentNode

Heading

Lesson

Chapter

Course

ParserResult

RendererResult
```

---

# Cache

以后：

```
Markdown

↓

AST
```

不用每次解析。

缓存：

```
AST

HTML

TOC
```

---

# 整个调用流程

```
Page

↓

useLesson()

↓

Query

↓

Engine

↓

Source

↓

Loader

↓

Parser

↓

Transformer

↓

Renderer

↓

Vue
```

任何技术替换：

```
Markdown
↓

Database
```

不会影响：

```
Renderer

Transformer

Query
```

---

# 我认为还应该再增加一个目录：`contracts`

这是我与 Nuxt Content 最大的不同，也是我认为长期维护最重要的一点。

```
modules/content/
├── contracts/
│   ├── Source.ts
│   ├── Parser.ts
│   ├── Transformer.ts
│   ├── Renderer.ts
│   ├── Loader.ts
│   └── Query.ts
```

这里不写任何实现，只定义**接口契约**（每个模块应该提供什么能力、输入输出是什么）。

例如，所有数据源（Markdown、数据库、CMS）都实现同一套 `Source` 契约；所有解析器都遵循 `Parser` 契约；所有转换器都遵循 `Transformer` 契约。这样，当你未来替换 Content v3 或引入新的数据源时，只需要新增实现，而不需要修改 Engine 的整体流程。

**这是我最推荐保留的部分。** 目录结构可以随着项目成长调整，但以契约驱动 Engine、以 Pipeline 串联流程，这两点会让你的 Content Engine 在未来几年里都保持稳定，而不是随着技术栈变化不断推翻重来。
