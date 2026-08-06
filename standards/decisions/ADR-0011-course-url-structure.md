# ADR-0011 课程 URL 结构与内容组织模型调整

## Status

Accepted

---

## Date

2026-08-06

---

## Context

原架构采用 Domain → Topic → Lesson 三层模型，Domain 作为网站导航结构和 URL 层级。这导致：

1. **URL 暴露内部结构**：URL 反映数据库组织方式（`/[domain]/[topic]/[lesson]`），而非稳定的知识结构
2. **页面冗余**：独立 `/map` 页面 + `/[domain]` 层级，增加页面数量但未创造学习价值
3. **教学结构与知识结构耦合**：Domain 同时承担知识分类和 URL 层级，未来调整教学组织会影响 URL 稳定性
4. **Chapter 角色不清晰**：Chapter 作为教学组织单元，其职责与 Domain 存在重叠

---

## Decision

**采用 Course → Topic → Lesson 模型，URL 统一使用 `/courses` 入口。**

### 核心变更

1. **内容模型**：从 Domain → Topic → Lesson 调整为 Course → Topic → Lesson
2. **URL 结构**：
   - `/courses` — 课程知识地图（取代 `/map`）
   - `/courses/{topic}` — 学习主题页（取代 `/[domain]/[topic]`）
   - `/courses/{topic}/{lesson}` — 课时学习页（取代 `/[domain]/[topic]/[lesson]`）
3. **Domain 废弃**：不再作为网站导航结构和 URL 层级
4. **Chapter 明确**：作为教学组织单元继续存在，但不作为 URL 层级
5. **URL 与教学结构分离**：URL 表达知识归属，Chapter 管理教学顺序

### 实体职责

| 实体 | 职责 | URL 层级 |
|------|------|---------|
| Course | 课程入口、全局知识地图、课程导航 | `/courses` |
| Topic | 知识分类、URL 一级路径、知识检索、内容聚合 | `/courses/{topic}` |
| Chapter | 组织 Lesson、规划学习路线、确定学习顺序 | 不作为 URL 层级 |
| Lesson | 最小学习单元、承载课程内容 | `/courses/{topic}/{lesson}` |

### 数据库设计方向

```
Topic
 |
 ├── Chapter
 |
 └── Lesson

Chapter
 |
 └── Lesson
```

Lesson 需要能够确定：
- 所属 Topic
- 所属 Chapter
- 在 Chapter 中的位置

排序关系：
- `Chapter.order` — Chapter 在 Topic 中的顺序
- `Lesson.order` — Lesson 在 Chapter 中的顺序

---

## Consequences

### 正面影响

1. **URL 稳定**：未来调整 Chapter（增加章节、合并章节、调整教学顺序）不影响 Lesson URL
2. **页面简化**：删除 `/map` 和 `/[domain]` 层级，减少页面数量
3. **职责清晰**：Topic 负责知识归属，Chapter 负责教学组织
4. **符合产品原则**：URL 表达稳定的知识结构，而非内部数据库组织

### 需要迁移的内容

- 路由结构：`/[domain]/` → `/courses/`
- API：`/api/domains` → `/api/courses`
- 页面组件：`pages/[domain]/` → `pages/courses/`
- 废弃 `pages/map.vue`

### 不变更的内容

- 数据库 Schema 暂不修改，等待字段设计最终确认
- Course → Chapter → Lesson 数据关系保持不变
- Progress 模块不受影响
- Markdown Engine 不受影响

---

## Supersedes

- ADR-0002（Domain → Topic → Lesson 内容模型）

---

## Related Documents

- [PAGE_ARCHITECTURE.md](../PAGE_ARCHITECTURE.md) — V3 页面架构设计
- [00-project-overview.md](../handbook/00-project-overview.md) — 项目概览
- [LDS.md](../LDS.md) — 课时设计规范
- [02-development-rules.md](../handbook/02-development-rules.md) — 开发规则
