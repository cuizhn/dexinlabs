# Open Questions

> 本文件记录项目中尚未形成最终决定、但会影响未来产品、架构或学习体验的重要问题。

## 1. Purpose

`OPEN_QUESTIONS.md` 不记录普通开发任务。

只记录：

* 产品方向问题
* 学习体验问题
* 信息架构问题
* 核心领域模型问题
* 架构问题
* 会影响多个系统的设计问题

---

## 2. Status

* `OPEN` — 尚未解决
* `DISCUSSING` — 正在讨论
* `PROPOSED` — 已有方案，但尚未确认
* `DECIDED` — 已形成决定，应该转移到 `decisions/`
* `DEFERRED` — 暂时不决定

---

## 3. Current Questions

### Q001 — Lesson 页面最终学习结构

**Status:** `DISCUSSING`

Lesson 页面应该采用怎样的结构，才能同时满足：

* 学习沉浸感
* 学习位置感
* 内容阅读
* 学习辅助
* 后续练习
* Desktop / Mobile 使用

当前正在探索页面结构、导航和辅助信息之间的关系。

---

### Q002 — Lesson 左侧学习结构的职责

**Status:** `OPEN`

需要确定左侧区域究竟承担：

* Lesson 导航
* Chapter 导航
* 学习进度
* Lesson 内部结构
* 或多个职责的组合

需要避免将不同概念混合为单一 UI。

---

### Q003 — Learning Assistant 的职责

**Status:** `OPEN`

需要确定 Learning Assistant 是否主要用于：

* 当前 Lesson 提示
* 前置知识提醒
* 知识关联
* 学习状态反馈
* 诊断
* AI 对话

当前原则：

> Learning Assistant 不应默认等同于 Chatbot。

---

### Q004 — Knowledge Card 的来源

**Status:** `OPEN`

需要确定知识卡片是否：

* 直接由 LessonAST 节点生成
* 由独立知识模型生成
* LessonAST 与知识模型共同生成

需要明确：

> LessonAST 与 Concept / Knowledge Entity 之间的关系。

---

### Q005 — Topic 的多重职责

**Status:** `OPEN`

需要进一步确认 Topic 是否同时承担：

* 知识分类
* URL identity
* Lesson 组织
* 个性化学习路线中的知识节点

如果这些职责发生冲突，需要考虑是否进一步拆分概念。

---

### Q006 — Chapter 与个性化学习路线

**Status:** `OPEN`

Chapter 当前主要负责组织 Lesson 顺序。

需要确定：

> 个性化学习路线是否应该直接使用 Chapter 顺序，还是建立独立的 Learning Path。

---

### Q007 — Lesson 导航的来源

**Status:** `OPEN`

需要确定“上一课 / 下一课”由什么决定：

* Chapter 顺序
* Topic 内顺序
* 学习路径
* 学生当前学习状态
* 推荐系统

可能需要区分：

> 内容顺序 ≠ 个性化学习顺序。

---

### Q008 — LessonAST 的下游消费者

**Status:** `OPEN`

目前已经明确 LessonAST 不只是 HTML 渲染中间格式。

仍需要进一步明确不同 AST 节点可能被哪些系统消费：

```text
Renderer
Knowledge Card
Practice
Progress
Search
Learning Diagnostics
```

需要避免 AST 承担过多业务职责。

---

## 4. Resolution Rule

当一个问题被确认后：

1. 更新本文件
2. 将最终决定写入 `decisions/`
3. 如果改变架构，同步 `ARCHITECTURE.md`
4. 如果改变项目整体状态，同步 `CURRENT_STATE.md`

不要同时在多个文件中维护同一份完整决策内容。

---

## 5. Agent Rule

Agent 遇到本文件中的 `OPEN`、`DISCUSSING` 或 `PROPOSED` 问题时：

> 不得将其当成已经确定的产品或架构规则。

Agent 可以：

* 分析问题
* 提出方案
* 说明影响
* 提供建议

但最终决定必须经过项目负责人确认。
