请执行以下方案，作为当前项目 **Lesson 内容同步机制** 的确定设计。

# Lesson 内容 Pull / Compile / Push 机制

## 1. 目标

建立数据库 Lesson 与本地 Markdown 源文件之间的开发工作流。

核心原则：

* `lessons/` 是人工编辑的 Markdown 源文件。
* Database 保存编译后的 Lesson AST。
* `compile` 负责 Markdown → Lesson AST。
* `push` 负责 Lesson AST → Database。
* `pull` **不做 AST → Markdown 反向转换**。
* `pull` 只根据数据库中的 Lesson 元数据，在本地创建缺失的 Markdown 源文件骨架。

---

## 2. 数据流

```text
PostgreSQL
    │
    │ pull
    ↓
Lesson metadata
    │
    ↓
创建 Markdown skeleton
    │
    ↓
lessons/*.md
    │
    │ 人工编辑
    ↓
Compiler
    │
    ↓
Lesson AST JSON
    │
    ↓
compile/output/
    │
    │ push
    ↓
PostgreSQL
```

正式内容源始终是：

```text
lessons/
```

数据库不是 Markdown 源文件。

---

## 3. Pull

提供：

```bash
npm run content:pull
```

Pull 时从数据库读取 Lesson 的必要元数据，例如：

```text
id
slug
title
topic
chapter
order
```

根据这些信息创建本地 Markdown 文件。

例如数据库：

```text
id: abc
slug: why-function
title: 为什么需要函数？
topic: function
chapter: introduction
order: 1
```

生成：

```text
lessons/
└── function/
    └── introduction/
        └── why-function.md
```

文件初始内容：

```md
---
id: abc
slug: why-function
title: 为什么需要函数？
topic: function
chapter: introduction
---

```

这里的正文为空，由课程编辑者重新编写。

### Pull 的重要限制

Pull **不得尝试将数据库中的 Lesson AST JSON 转换成 Markdown**。

Pull 只负责：

```text
Database Lesson metadata
        ↓
Markdown 文件骨架
```

---

## 4. 已存在文件不得覆盖

Pull 必须具有保护机制。

例如：

```text
lessons/function/introduction/why-function.md
```

已经存在时：

```text
pull
  ↓
发现文件已存在
  ↓
跳过
```

不得覆盖已有 Markdown 源文件。

只有不存在的文件才创建。

这样可以避免误执行 `pull` 导致课程内容丢失。

---

## 5. Compile

提供：

```bash
npm run content:compile
```

编译：

```text
lessons/
    ↓
Markdown Compiler
    ↓
Lesson AST
    ↓
compile/output/
```

例如：

```text
lessons/function/introduction/why-function.md
```

生成：

```text
compile/output/why-function.json
```

或者采用项目已经确定的 output 命名/目录规则。

Compile 后的 JSON 是构建产物，不是人工编辑源。

---

## 6. Push

提供：

```bash
npm run content:push
```

Push：

```text
compile/output/*.json
        ↓
Lesson AST
        ↓
Database
```

Push 时必须依据 Lesson 的稳定 `id` 更新对应数据库记录：

```text
WHERE lesson.id = metadata.id
```

不要因为 title 或 slug 发生变化而自动创建新的 Lesson。

`id` 是数据库 Lesson 的稳定身份标识。

---

## 7. Metadata

Markdown frontmatter 至少保留能够确定 Lesson 身份和基本结构的信息。

例如：

```yaml
---
id: abc
slug: why-function
title: 为什么需要函数？
topic: function
chapter: introduction
order: 1
---
```

具体字段以当前 Lesson Schema 和 Lesson AST 设计为准，不要重复存储不必要的信息。

---

## 8. 职责边界

### `lessons/`

人工编辑的课程源文件。

### `compile/`

Compiler 及其构建产物。

### `compile/output/`

Lesson AST JSON 编译产物。

不作为人工编辑入口。

### PostgreSQL

保存运行时使用的 Lesson AST 以及其他业务数据。

### Pull

```text
Database metadata → Markdown skeleton
```

### Compile

```text
Markdown → Lesson AST
```

### Push

```text
Lesson AST → Database
```

不要增加：

```text
Lesson AST → Markdown
```

反向编译器。

---

## 9. 典型开发流程

首次需要编辑数据库中的测试 Lesson：

```bash
npm run content:pull
```

得到：

```text
lessons/
├── lesson-01.md
├── lesson-02.md
└── lesson-03.md
```

然后人工编辑 Markdown。

完成后：

```bash
npm run content:compile
npm run content:push
```

最终：

```text
Markdown
  ↓
AST
  ↓
Database
```

以后继续修改时，直接编辑已有的 `lessons/*.md`，不需要再次 Pull。

---

## 10. 不要实现的方案

不要实现：

```text
Database AST
    ↓
AST → Markdown
    ↓
lessons/*.md
```

也不要让 `pull` 默认覆盖已有 Markdown。

当前系统明确采用：

> **Markdown 单向作为课程内容源，数据库保存编译后的 Lesson AST；Pull 只负责根据数据库 Lesson metadata 建立缺失的本地源文件骨架。**
