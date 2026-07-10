# Content Engine V1 接入迁移任务

## 当前状态

Content Engine V1 已完成核心实现。

但是当前应用层仍然存在旧的数据访问链路：

```text
Page
 ↓
Composable
 ↓
API Route
 ↓
Database / Drizzle
```

导致 Content Engine 虽然存在，但没有成为实际内容访问入口。

本阶段目标：

**将现有内容读取流程迁移到 Content Engine，建立唯一内容访问链路。**

---

# 迁移目标

最终链路必须变为：

```text
Page
 ↓
Composable
 ↓
API Route
 ↓
Content Engine
 ↓
Repository Interface
 ↓
Drizzle Repository
 ↓
Database
```

页面和 composable 不需要大规模修改。

重点修改 API 层，使 API 不再直接访问数据库。

---

# 修改原则

## 1. API 层禁止直接访问数据库

禁止：

```javascript
server/api/chapter.get.js

import { db } from ...
```

禁止：

* Drizzle 查询
* SQL
* 数据表结构依赖

API 只负责：

* 接收参数
* 调用 Content Engine
* 返回结果

---

## 2. Content Engine 成为唯一内容入口

所有内容读取必须经过：

```javascript
contentEngine
```

包括：

* course
* chapter
* lesson
* exercise
* content

禁止绕过 Content Engine。

---

# 第一阶段迁移范围

优先迁移：

## Chapter

旧：

```text
/api/chapter
/api/chapter/[slug]
```

改为：

```text
API
 ↓
Content Engine
 ↓
Chapter Service
 ↓
Repository
```

---

## Lesson

旧：

```text
/api/lesson
/api/lesson/[slug]
```

迁移到：

```text
Content Engine Lesson Service
```

---

## Course

迁移到：

```text
Content Engine Course Service
```

---

# 保持前端接口稳定

不要修改：

```javascript
useChapter()

useLesson()

useCourse()
```

例如：

原来：

```javascript
const { chapters } = await useChapter()
```

迁移后仍然保持：

```javascript
const { chapters } = await useChapter()
```

前端不应该感知架构变化。

---

# 迁移步骤

## Step 1

检查当前 API：

寻找：

* server/api/chapter
* server/api/lesson
* server/api/course

确认所有直接数据库访问位置。

---

## Step 2

修改 API 调用 Content Engine。

例如：

修改前：

```javascript
const data = await db.query.chapter.findMany()
```

修改后：

```javascript
const data = await contentEngine.chapter.list()
```

---

## Step 3

确认 Repository 是唯一数据库访问层。

数据库访问只能存在：

```text
Repository Implementation
```

---

## Step 4

运行测试。

确认：

* 页面显示正常
* 数据结构保持一致
* SSR 正常
* API 返回格式不变化

---

## Step 5

删除旧查询代码。

迁移完成后：

删除：

* API 内重复查询逻辑
* API 内数据库依赖
* 重复 service

---

# 本阶段不要做

不要：

* 增加 Cache
* 增加 Search
* 增加 CMS
* 重构 Content Model
* 修改前端结构
* 修改数据库结构

当前唯一目标：

**让 Content Engine V1 真正成为应用的数据入口。**

---

# 完成标准

满足以下条件：

* [ ] 页面请求内容经过 Content Engine
* [ ] API 不直接访问数据库
* [ ] Repository 是唯一数据库入口
* [ ] Chapter/Lesson/Course 完成迁移
* [ ] 前端 composables API 保持不变
* [ ] 旧数据访问代码删除

完成后，Content Engine V1 才算真正落地。
