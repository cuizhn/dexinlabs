# Current State

> 本文件记录项目当前实际状态。
>
> 它不是架构规范，也不是未来计划。
> 状态应以实际代码、测试和已确认的项目状态为依据。

## 1. How to Read This File

状态标记：

* `DONE` — 已完成并可作为当前系统能力使用
* `IN PROGRESS` — 正在开发
* `PARTIAL` — 已有实现，但尚未完整
* `PLANNED` — 已确认但尚未实施
* `EXPLORING` — 正在研究，尚未形成决定
* `BLOCKED` — 存在未解决问题
* `UNKNOWN` — 当前状态尚未确认

---

## 2. Product

### Core Product

`IN PROGRESS`

得心实验室定位为以理解优先为核心的 K12 数学学习平台。

当前重点仍然是课程系统和 Lesson 学习体验。

---

## 3. Content Model

### Course → Topic → Chapter → Lesson

`DONE / CURRENT MODEL`

当前采用：

```text
Course
 └── Topic
      └── Chapter
           └── Lesson
```

具体字段、关系和约束以数据库 Schema 与 `ARCHITECTURE.md` 为准。

---

## 4. Lesson

### Lesson as Learning Unit

`DONE / CURRENT PRINCIPLE`

Lesson 是当前课程系统的基本学习单元。

Lesson 同时承担：

* 课程内容
* 学习体验
* 学习导航
* 后续学习数据关联的基础

---

## 5. LessonAST

`IN PROGRESS / CORE SYSTEM`

Lesson 内容采用 LessonAST 作为语义表示。

当前核心原则：

```text
Lesson Content
→ LessonAST
→ Semantic Rendering
```

LessonAST 不等同于 HTML。

具体节点及消费方式以当前代码和相关 Decision Records 为准。

---

## 6. Rendering

`IN PROGRESS`

当前方向：

```text
LessonAST
→ Renderer
→ HTML / UI
```

内容语义与视觉呈现保持分离。

---

## 7. Application Architecture

`CURRENT`

当前系统采用分层结构。

主要方向：

```text
Page
→ Composable
→ API
→ Service
→ Repository
→ Database
```

具体架构以 `ARCHITECTURE.md` 为准。

---

## 8. Design / Learning Experience

`EXPLORING`

当前正在研究 Lesson 的学习型页面设计。

已形成的方向包括：

* Lesson 应区别于普通文章页面
* 学习内容应成为页面视觉中心
* 页面应支持明确的学习过程
* 学习辅助信息不应过度干扰正文
* Desktop 与 Mobile 应根据学习任务重新组织，而不是简单缩放

具体设计决策以 `decisions/` 为准。

---

## 9. Practice

`PLANNED / STATUS TO VERIFY`

练习系统属于产品整体规划的一部分。

具体当前代码完成度需要根据实际代码确认。

---

## 10. Learning Progress

`PLANNED / STATUS TO VERIFY`

学习进度属于产品整体规划的一部分。

具体当前代码完成度需要根据实际代码确认。

---

## 11. Learning Notes

`PLANNED / STATUS TO VERIFY`

学习笔记属于产品整体规划的一部分。

具体当前代码完成度需要根据实际代码确认。

---

## 12. Current Design Questions

当前未解决的设计问题不在本文件展开。

请查看：

`OPEN_QUESTIONS.md`

---

## 13. Current Decisions

长期产品和架构决策不在本文件重复记录。

请查看：

`decisions/`

---

## 14. Updating This File

本文件只在以下情况发生时更新：

* 一个重要系统从未完成变为完成
* 核心系统进入新的开发阶段
* 当前实现状态发生重大变化
* 项目整体重点发生变化

普通代码修改不需要更新本文件。

---

## 15. Source of Truth

当本文件与实际代码冲突时：

1. 报告冲突
2. 确认真实状态
3. 修正文档或代码
4. 必要时更新 Decision Record

不得默默忽略冲突。
