# Architecture Audit

> Purpose:
>
> 检查当前项目是否遵守 Architecture.md。

---

# 1. Call Chain

标准调用链：

Page

↓

Composable

↓

API

↓

Service

↓

Repository

↓

Database

检查结果：

□ Page 未调用 Repository

□ Page 未调用 Database

□ Component 未访问 Database

□ API 未访问 Repository

□ Repository 未包含业务逻辑

□ Markdown 未依赖业务模块

---

# 2. Responsibility Check

Page

□ 仅展示

Composable

□ 仅数据获取

API

□ 仅参数校验

Service

□ 仅业务逻辑

Repository

□ 仅数据访问

Markdown

□ 仅 Markdown 能力

Database

□ 仅数据存储

---

# 3. Dependency Check

禁止：

Page → Repository

Page → Database

Page → Markdown 内部实现

API → Repository

Repository → Service

Repository → API

Markdown → Repository

Markdown → Database

Service → Page

Service → Component

Service → Service（原则上禁止）

---

# 4. Stable Architecture Checklist

□ 未新增无意义抽象

□ 未新增 Mapper

□ 未新增 DTO

□ 未新增 Entity

□ 未重复封装第三方

□ 每种能力只有唯一负责人

□ Engine 未保存业务状态

---

# 5. Audit Result

Status：

✅ Pass

或

❌ Failed

Issues：

-

-

-

---

# 6. Development Rule

新增代码必须满足：

- 遵守 Architecture.md
- 不破坏依赖方向
- 不增加无意义分层
- 不重复实现成熟能力