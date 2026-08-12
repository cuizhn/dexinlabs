# Project Context

## 1. Project Identity

得心实验室（Dexin Labs）是一个以理解优先为核心理念的 K12 数学学习平台。

项目目标不是简单提供教材数字化，而是构建支持学生理解、练习、反思和持续学习的数字学习环境。

---

## 2. Core Principles

1. Education goals > technology goals
2. Understanding > memorization
3. Learning experience > feature quantity
4. Long-term maintainability > short-term optimization
5. Semantic content > presentation details
6. Systems should serve learning

---

## 3. Product Model

核心学习内容采用：

Course → Topic → Chapter → Lesson

### Course
完整课程/知识体系。

### Topic
知识主题，也是学习路径和 URL 的重要知识身份。

### Chapter
组织 Lesson 的学习序列，不作为主要知识身份。

### Lesson
最基本的学习单元。

Lesson 是内容系统、学习体验和未来学习数据的重要基本单位。

---

## 4. Content Model

Lesson 的核心内容采用 LessonAST。

LessonAST 是课程内容的语义表示，而不是 HTML 或 CSS 的替代形式。

不同 AST 节点可能具有：

- 不同的教学意义
- 不同的渲染方式
- 不同的数据消费方式
- 不同的计算或学习行为

内容语义与视觉呈现应保持分离。

---

## 5. System Boundaries

系统主要由以下部分组成：

Content
→ LessonAST
→ Rendering

Application
→ Page
→ Composable
→ API
→ Service
→ Repository
→ Database

具体结构以 ARCHITECTURE.md 为准。

---

## 6. Current Architecture Status

当前项目已经建立：

- Course / Topic / Chapter / Lesson 模型
- LessonAST
- Service / Repository 分层
- Lesson 渲染体系
- Handbook
- Decision Records

具体实现状态以代码和 ARCHITECTURE.md 为准。

---

## 7. Important Decisions

重要架构和产品决策不在本文件重复记录。

请读取：

`decisions/`

当当前任务涉及已有决策时，必须先阅读相关 Decision Record。

---

## 8. Agent Entry Protocol

### Before work

对于中型和大型任务，Agent 必须：

1. 阅读 PROJECT_CONTEXT.md
2. 阅读 ARCHITECTURE.md
3. 阅读相关 Decision Records
4. 检查任务涉及的实际代码路径
5. 进行 Context Audit
6. 确认影响范围后再修改代码

不得仅根据单个组件或单个文件推断整个系统。

### During work

如果发现：

- 当前代码与文档冲突
- 任务要求与既有架构冲突
- 需要改变已有核心决策
- 发现多个合理但方向不同的方案

必须暂停实现并报告，不得自行做产品或架构决策。

### After work

完成任务后：

- 更新受影响的文档
- 如果产生新的长期决策，由用户/项目负责人确认后记录到 `decisions/`
- 不把未经确认的实现选择写成项目决策