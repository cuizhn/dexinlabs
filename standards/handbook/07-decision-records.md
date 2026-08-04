# Decision Records

## 1. 文档定位

本文档定义得心实验室项目的设计决策记录（Architecture Decision Records，ADR）规范。

Decision Record 用于记录对项目具有长期影响的重要决策，包括：

- 架构设计；
- 技术选型；
- 数据模型；
- 模块职责；
- 开发规范。

其目标是：

- 保留设计背景；
- 解释设计原因；
- 避免重复讨论；
- 帮助新成员和 AI Agent 快速理解项目。

---

# 2. 什么需要记录

以下情况必须新增 Decision Record：

## 架构调整

例如：

- 新增 Engine；
- 调整模块职责；
- 修改系统层次。

---

## 技术选型

例如：

- 更换数据库；
- 更换 ORM；
- 更换 Markdown 方案；
- 引入新的核心依赖。

---

## 数据结构调整

例如：

- 修改数据库 Schema；
- 修改核心数据模型；
- 调整内容组织方式。

---

## 长期规范

例如：

- 新的开发规则；
- 新的测试规范；
- 新的目录结构。

---

## 不需要记录

以下情况通常无需新增 ADR：

- Bug 修复；
- UI 调整；
- 文案修改；
- CSS 优化；
- 小型重构；
- 性能微调。

---

# 3. ADR 编号

采用连续编号。

例如：

```
ADR-0001
ADR-0002
ADR-0003
```

编号一经使用，不再修改。

---

# 4. 存放位置

建议：

```
standards/
└── decisions/
    ADR-0001-project-structure.md
    ADR-0002-renderer-boundary.md
    ADR-0003-markdown-engine.md
```

Handbook 仅定义规范。

具体 ADR 独立存放。

---

# 5. ADR 生命周期

状态（Status）应为以下之一：

| 状态 | 含义 |
|------|------|
| Proposed | 提案中 |
| Accepted | 已采纳 |
| Superseded | 已被替代 |
| Deprecated | 已废弃 |

任何状态变化都应记录原因。

---

# 6. ADR 模板

所有 ADR 使用统一模板。

```markdown
# ADR-XXXX 标题

## Status

Accepted

---

## Date

YYYY-MM-DD

---

## Context

当前背景是什么？

为什么需要做这个决策？

存在哪些问题？

---

## Decision

最终决定是什么？

应尽可能明确。

---

## Alternatives Considered

考虑过哪些方案？

为什么没有采用？

---

## Consequences

该决策带来的影响：

优点：

-

缺点：

-

需要注意：

-

---

## Related Documents

关联文档：

- Architecture
- Development Rules
- Coding Style

```

---

# 7. 编写原则

Decision Record 应记录：

**为什么这样设计（Why）**

而不是：

**如何实现（How）**

实现细节属于代码或设计文档。

---

# 8. 修改原则

Decision Record 不应直接覆盖历史。

如果设计发生重大变化：

新增新的 ADR。

例如：

```
ADR-0008

Supersedes

ADR-0003
```

保留历史记录。

---

# 9. AI Agent 要求

AI Agent 在以下情况下应建议新增 ADR：

- 修改系统架构；
- 修改模块职责；
- 引入新的核心依赖；
- 调整数据模型；
- 修改长期规范。

AI Agent 不应擅自删除已有 ADR。

---

# 10. 推荐 ADR 列表

项目初期建议建立以下 ADR：

| 编号 | 标题 |
|------|------|
| ADR-0001 | Project Structure |
| ADR-0002 | Domain → Topic → Lesson 内容模型 |
| ADR-0003 | Content Engine 与 Markdown Engine 分离 |
| ADR-0004 | Renderer 仅负责展示 |
| ADR-0005 | HTML 语义化优先 |
| ADR-0006 | Service Layer Boundary |
| ADR-0007 | Database Schema Strategy |
| ADR-0008 | Markdown Rendering Pipeline |
| ADR-0009 | Content Rendering Responsibility |

后续按时间顺序持续增加。

---

# 11. 决策原则

每个 ADR 都应回答以下问题：

1. 为什么需要这个决策？
2. 是否存在其他方案？
3. 为什么选择当前方案？
4. 会带来哪些长期影响？
5. 将来是否容易调整？

如果无法回答上述问题，则说明该决策尚不成熟，不建议立即采纳。

---

# 12. 核心理念

Decision Record 是项目知识的一部分。

代码说明系统**现在是什么**。

ADR 说明系统**为什么会变成现在这样**。

随着项目演进，代码可以重构，架构可以调整，但设计决策应始终可追溯。