
# Project Overview

## 1. 项目名称

**得心实验室（Dexin Labs）**

项目定位：面向 K12 学生的数学学习平台。

核心理念：

> 理解为先，应用为本。

项目目标不是简单提供题库或知识点讲解，而是帮助学生建立数学理解能力、应用能力和自主学习能力。

---

# 2. 项目愿景

传统数学学习存在几个问题：

- 学生学习大量知识，但缺少知识之间的联系。
- 习题训练很多，但缺少对概念本质的理解。
- 家长依赖课外辅导，但无法持续提供有效学习支持。
- 教材按照章节组织，但学生真正需要的是知识体系。

得心实验室希望建立一个：

- 结构化的数学知识体系；
- 以理解为核心的课程内容；
- 支持自主学习和反馈的学习环境；
- 人工智能时代下的人机协同学习平台。

---

# 3. 产品定位

## 3.1 服务对象

主要面向：

- 小学至高中阶段学生；
- 需要系统学习数学知识的学习者；
- 希望了解孩子学习情况的家长。

---

## 3.2 产品核心能力

当前规划：

### 学习系统

提供：

- 数学课程学习；
- 知识体系浏览；
- 学习进度记录；
- 学习笔记。

---

### 练习系统

提供：

- 针对性练习；
- 错误分析；
- 学习反馈。

---

### 学习分析

提供：

- 学习状态分析；
- 知识掌握情况判断；
- 学习建议。

---

### AI 辅助学习

未来支持：

- 概念解释；
- 学习问答；
- 学习路径推荐；
- 个性化反馈。

AI 是学习辅助工具，不替代课程体系和教学设计。

---

# 4. 内容组织模型

项目采用以下核心内容结构：

```
Course
└── Topic
    ├── Chapter
    │   └── Lesson
    └── Lesson
```

URL 优先表达稳定的知识结构，而不是内部数据库组织结构。

---

## Course（课程）

表示完整课程。

数据库字段：`id`, `slug`, `title`

主要职责：

- 课程入口
- 全局知识地图
- 课程导航

当前数学课程直接使用 `/courses` 入口，不增加额外课程名称层级。

---

## Topic（知识主题）

表示稳定的知识领域。

数据库字段：`id`, `slug`, `title`, `order`

例如：

- 函数
- 方程
- 几何
- 概率

主要职责：

- 知识分类
- URL 一级路径
- 知识检索
- 内容聚合
- AI 推荐基础

URL 示例：

```
/courses/functions
```

---

## Chapter（教学单元）

表示教学组织单元，不作为 URL 层级。

数据库字段：`id`, `title`, `slug`, `order`, `topic_id`

主要职责：

- 组织 Lesson
- 规划学习路线
- 确定 Lesson 学习顺序
- 表达阶段性教学结构

Chapter 作为教学组织概念存在，未来调整 Chapter（增加章节、合并章节、调整教学顺序）不应影响 Lesson URL。

---

## Lesson（课时）

表示最小学习单元。

数据库字段：`id`, `slug`, `title`, `order`, `content`（JSONB）, `topic_id`, `chapter_id`

一个 Lesson 应回答：

- 为什么学习？
- 要解决什么问题？
- 核心概念是什么？
- 如何应用？

Lesson 同时具有：

- `topic_id`：知识归属（属于哪个知识主题）
- `chapter_id`：教学归属（属于哪个教学章节）
- `order`：学习顺序

Lesson URL：

```
/courses/{topic.slug}/{lesson.slug}
```

例如：

```
/courses/functions/what-is-function
```

唯一约束：`(topic_id, slug)` 组合唯一，允许不同主题下存在相同 slug。

---

## URL 与教学结构分离原则

URL 表达知识归属，教学结构由 Chapter 管理。

例如：

```
Topic: 函数
Chapter: 函数基础
Lesson: 什么是函数
```

URL：`/courses/functions/what-is-function`

数据库模型：

- Topic 与知识领域对应
- Chapter 管理教学组织（通过 `topic_id` 关联 Topic）
- Lesson 同时关联 Topic（`topic_id`）和 Chapter（`chapter_id`）
- Lesson 在 Chapter 中具有顺序（`order`）
- Chapter 调整 Lesson 顺序时，不改变 Lesson URL

---

## URL 规范

统一使用以下 URL 结构：

```
/courses                                    → 知识地图
/courses/{topic.slug}                       → 主题详情
/courses/{topic.slug}/{lesson.slug}         → 课时学习
/exercise?topic={topic.slug}                → 练习
```

Chapter 不进入 URL。

---

## HTML 语义规范

数据库实体与 HTML 语义元素不存在一一对应关系。

不要根据数据库实体名称机械选择 HTML 标签。

例如：

- Lesson ≠ `<section>`
- Chapter ≠ `<section>`

Lesson 详情页可以根据实际文档语义使用：

```html
<article>
```

Lesson 内部的不同主题内容可以根据实际语义使用：

```html
<section>
```

HTML 元素必须根据页面实际语义确定。

---

# 5. 教学设计原则

课程内容遵循：

## 理解优先

学生首先需要知道：

- 为什么需要这个知识；
- 它解决什么问题；
- 它与已有知识有什么关系。

---

## 应用驱动

知识不是孤立记忆，而需要：

- 现实情境；
- 问题解决；
- 迁移应用。

---

## 主动建构

课程设计参考：

- 费曼学习法；
- 刻意练习；
- 探究式学习。

---

课程结构规范由 LDS（Lesson Design Specification）定义。

具体课程规范不属于本文档。

---

# 6. 技术定位

项目采用现代 Web 技术构建。

主要技术：

- Nuxt
- Vue
- TypeScript
- PostgreSQL
- Drizzle ORM

---

核心系统：


Content Engine
|
↓
Markdown Engine
|
↓
Renderer
|
↓
Web Application


---

## Content Engine

负责：

- 内容组织；
- 内容获取；
- 业务层服务。

---

## Markdown Engine

负责：

- Markdown 解析；
- 内容转换；
- HTML 输出。

Markdown Engine 与 Content Engine 保持独立。

---

## Renderer

负责：

- 页面展示；
- HTML 渲染；
- UI 组合。

Renderer 不负责业务逻辑和内容处理。

---

# 7. 项目开发原则

所有开发活动遵循：

## 简单优先

避免：

- 过度设计；
- 不必要抽象；
- 为未来不存在的问题提前复杂化。

---

## 可维护优先

代码需要：

- 清晰职责；
- 明确边界；
- 易于理解。

---

## 标准优先

优先遵循：

- Web 标准；
- HTML 语义化；
- TypeScript 类型约束；
- 社区成熟方案。

---

# 8. AI Agent 协作原则

本项目未来会由多个 AI Agent 和开发者共同维护。

因此：

所有 Agent 必须：

- 阅读项目标准文档；
- 理解架构约束；
- 遵循开发流程；
- 记录重要决策。

Agent 不应：

- 自行改变架构；
- 引入新的技术体系；
- 修改核心设计原则；
- 删除已有约束。

---

# 9. 文档体系

项目标准目录：

```

standards/
│
├── 00-project-overview.md
├── 01-architecture.md
├── 02-development-rules.md
├── 03-coding-style.md
├── 04-workflow.md
├── 05-agent-skills.md
└── 06-decision-records.md

```

职责：

| 文件 | 作用 |
|-|-|
|00-project-overview|项目背景、目标、原则|
|01-architecture|系统架构设计|
|02-development-rules|开发约束和规则|
|03-coding-style|代码风格规范|
|04-workflow|开发流程|
|05-agent-skills|AI Agent 工作规范|
|06-decision-records|重要设计决策记录|

---

# 10. 当前阶段目标

当前阶段：

建立 MVP 学习平台基础能力。

重点：

1. 完成课程系统；
2. 建立内容生产流程；
3. 完善内容引擎；
4. 建立稳定前端架构；
5. 为未来 AI 学习助手预留接口。

---

# 11. 非目标

当前阶段不追求：

- 大规模用户增长；
- 复杂商业系统；
- 完整 AI 教师替代方案；
- 复杂社交功能。

优先建立：

稳定的知识体系 + 高质量学习体验。

---

# 12. 项目决策原则

当出现设计选择时，优先级：

1. 是否提升学生学习效果；
2. 是否保持系统长期可维护；
3. 是否符合项目整体架构；
4. 是否降低未来扩展成本。

任何技术选择都应服务于教育目标，而不是技术本身。
