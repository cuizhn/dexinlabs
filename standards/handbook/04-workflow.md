# Development Workflow

## 1. Purpose

本文件定义得心实验室项目中 AI Agent、执行者和项目负责人的协作流程。

核心原则：

> 先理解上下文，再分析影响，再确定方案，最后修改代码。

不得因为任务目标明确，就跳过项目上下文分析。

---

## 2. Roles

### Project Owner

负责：

* 产品方向
* 学习体验
* 核心产品行为
* 信息架构
* 核心领域模型
* 重要技术与架构决策
* 最终决策

### AI / Design & Architecture Collaborator

负责：

* 理解和澄清需求
* 分析问题
* 提出方案
* 比较方案及其影响
* 发现架构冲突
* 将确认后的决策结构化
* 协助制定执行方案

### Executor

负责：

* 阅读项目上下文
* 分析现有实现
* 实施已确认的方案
* 编写和修改代码
* 测试和验证
* 更新必要的项目文档

Executor 不得未经确认擅自改变产品方向或核心架构。

---

## 3. Task Classification

### Small Task

仅影响局部实现，例如：

* 样式调整
* 明确的 Bug 修复
* 单个组件内部修改
* 已确定行为的简单实现

通常只需要阅读相关代码。

### Medium Task

可能影响多个文件或一个完整功能，例如：

* Lesson 页面调整
* 新增一个业务组件
* Service 层修改
* API 调整
* Responsive 行为调整

必须阅读：

1. PROJECT_CONTEXT.md
2. ARCHITECTURE.md
3. 相关 Decision Records
4. 受影响代码

并进行 Context Audit。

### Large Task

涉及产品、架构、领域模型或多个系统，例如：

* Lesson 架构调整
* LessonAST 修改
* Course / Topic / Chapter / Lesson 模型调整
* URL / Information Architecture 调整
* 学习系统重新设计
* 跨层重构

必须先进行完整 Context Audit。

未经项目负责人确认，不得直接实施核心架构变化。

---

## 4. Context Reading Protocol

Medium / Large Task 开始前：

1. 阅读 `PROJECT_CONTEXT.md`
2. 阅读 `ARCHITECTURE.md`
3. 阅读相关 `decisions/`
4. 阅读 `CURRENT_STATE.md`
5. 阅读 `OPEN_QUESTIONS.md`
6. 根据任务搜索相关代码
7. 确认实际数据流和依赖关系

不得仅根据单个文件或组件推断整个系统。

---

## 5. Context Audit

Context Audit 的目的不是生成文档，而是建立当前任务的影响范围。

至少确认：

* 当前实现在哪里
* 数据从哪里来
* 数据经过哪些层
* 哪些组件依赖它
* 哪些业务规则与它相关
* 是否存在已有 Decision
* 是否存在未解决问题
* 是否存在架构冲突
* 哪些地方尚不确定

Context Audit 完成后，Executor 才开始实施。

---

## 6. Decision Gate

出现以下情况时，Executor 必须停止实施并请求确认：

* 需求存在多个合理解释
* 需要改变核心数据模型
* 需要修改 LessonAST
* 需要修改 Course / Topic / Chapter / Lesson 关系
* 需要改变 URL 或信息架构
* 需要改变跨层架构
* 当前代码与 `ARCHITECTURE.md` 冲突
* 当前代码与已有 Decision 冲突
* 需要创造新的产品行为
* 发现现有设计与项目目标存在明显冲突

Executor 可以提出方案，但不得自行选择产品或核心架构方案。

---

## 7. Implementation

方案确认后：

1. 明确修改范围
2. 保持现有架构边界
3. 优先复用现有能力
4. 避免无关重构
5. 修改代码
6. 运行相关测试
7. 检查类型、构建和运行结果
8. 检查是否影响其他层

---

## 8. Documentation After Implementation

任务完成后：

### 如果只是普通实现

无需新增 Decision。

### 如果产生新的长期架构或产品决策

由 Project Owner 确认后，由 Executor 将其记录到：

`decisions/`

### 如果项目当前状态发生变化

更新：

`CURRENT_STATE.md`

### 如果一个开放问题已经解决

更新：

`OPEN_QUESTIONS.md`

不应为了形式而创建文档。

---

## 9. Decision Records

Decision Record 的内容必须来源于已经确认的项目决策。

Executor 可以负责：

* 创建 Decision Record
* 整理讨论结果
* 补充技术后果
* 记录被否定的方案

Executor 不得：

* 自行创造产品决策
* 将个人推测写成项目决策
* 修改已有核心决策而不经过确认

---

## 10. Conflict Resolution

当以下信息发生冲突：

```text
Code
Architecture
Decision
Project Context
```

不得简单选择其中一个覆盖其他内容。

应：

1. 报告冲突
2. 确认哪个信息代表当前真实状态
3. 修正代码或文档
4. 必要时创建新的 Decision

项目实际代码不自动等于正确架构。

---

## 11. Completion Criteria

任务只有在以下条件满足后才视为完成：

* 实现符合已确认方案
* 未破坏既有架构边界
* 相关测试通过
* 没有未报告的重大影响
* 必要文档已同步
* 新产生的长期决策已经记录
* 未解决的问题已经明确标记
