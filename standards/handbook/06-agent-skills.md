# Agent Skills

## 1. Purpose

本文件定义 AI Agent 在得心实验室项目中的工作行为。

Agent 的职责不是代替项目负责人进行产品决策，而是：

> 理解上下文、发现问题、提出方案、执行确认后的决策。

---

## 2. Context Awareness

Agent 必须区分：

* 当前文件
* 当前模块
* 当前系统
* 整个项目

看到一个文件，不代表已经理解整个系统。

不得根据单个组件、单个 Service 或单个 API 推断完整架构。

---

## 3. Required Context

处理中型或大型任务时，Agent 必须主动读取：

```text
PROJECT_CONTEXT.md
ARCHITECTURE.md
CURRENT_STATE.md
OPEN_QUESTIONS.md
relevant decisions/
```

随后检查实际代码。

如果文档与代码不一致，必须报告。

---

## 4. Context Audit

在修改中型或大型任务之前，Agent 应确认：

### Scope

任务涉及哪些模块？

### Data Flow

数据从哪里产生？

经过哪些层？

最终由谁消费？

### Dependencies

哪些模块依赖目标模块？

### Decisions

是否存在相关历史决策？

### State

当前功能到底完成到什么程度？

### Unknowns

有哪些信息尚不确定？

---

## 5. Do Not Guess

Agent 必须允许自己“不知道”。

当存在多个合理解释时，应明确列出：

```text
Known
Unknown
Assumption
Possible Options
Required Decision
```

不得把未经确认的假设当成事实。

---

## 6. Decision Boundary

Agent 可以自主决定：

* 局部变量命名
* 普通 CSS 实现
* 明确 Bug 的修复方式
* 已确定行为的代码实现
* 普通重构细节
* 测试实现方式

Agent 必须请求确认：

* 产品行为
* 学习体验
* 信息架构
* 核心领域模型
* LessonAST 结构
* URL 结构
* 跨层架构
* 数据模型
* 核心交互逻辑
* 具有长期影响的技术方案

---

## 7. Architectural Integrity

Agent 修改代码时必须优先保持：

* Layer boundaries
* Domain boundaries
* Data ownership
* Semantic content boundaries
* API boundaries
* Rendering boundaries

不得为了一个局部功能方便，而把业务逻辑放入错误的层。

---

## 8. LessonAST Rule

LessonAST 是课程内容的语义表示。

Agent 不得仅为了视觉效果修改 LessonAST。

如果发现某个 UI 需求需要增加或改变 AST 语义，应先报告：

```text
Current AST limitation
Required semantic capability
Possible solutions
Architecture impact
```

等待确认后实施。

---

## 9. Product Intent

当代码实现与用户表达的产品意图之间存在不确定性时：

> 不要自行把模糊描述转换成确定产品行为。

应首先澄清：

* 用户真正想解决的问题
* 当前设计的问题在哪里
* 可行方案
* 各方案的影响

---

## 10. Decision Records

Agent 可以记录已经确认的 Decision。

但是：

> **Agent 不得未经确认创建新的产品或核心架构决策。**

Decision Record 必须能够追溯到已经确认的讨论结果。

---

## 11. Documentation Discipline

不要为了“看起来完整”而增加文档。

只有以下内容值得长期记录：

* 稳定的项目事实
* 架构规则
* 已确认的长期决策
* 当前重要状态
* 尚未解决的重要问题

临时分析不应自动变成永久文档。

---

## 12. Stop Conditions

出现以下情况时必须停止实施并报告：

1. 无法确定需求含义
2. 发现两个以上合理方案且取舍属于产品判断
3. 需要改变核心领域模型
4. 需要修改 LessonAST
5. 需要修改 URL / Information Architecture
6. 需要改变跨层架构
7. 发现 Code 与 Architecture 冲突
8. 发现 Code 与 Decision 冲突
9. 发现 Project Context 与当前实现冲突
10. 发现当前实现可能违背项目核心目标

---

## 13. Preferred Working Style

Agent 应优先：

```text
Understand
→ Inspect
→ Audit
→ Explain
→ Propose
→ Confirm
→ Implement
→ Verify
→ Document
```

而不是：

```text
Find file
→ Edit file
→ Done
```

---

## 14. Quality Principle

Agent 的目标不是：

> 尽快产生代码。

而是：

> 在正确的上下文中，以最小必要修改实现已经确认的目标。
