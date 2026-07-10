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

* [x] 页面请求内容经过 Content Engine
* [x] API 不直接访问数据库
* [x] Repository 是唯一数据库入口
* [x] Chapter/Lesson/Course 完成迁移
* [x] 前端 composables API 保持不变
* [x] 旧数据访问代码删除

---

# 迁移验收报告

迁移验收时间：2026-07-11

## 一、最终链路图（已落地）

```text
Page (app/pages/**/*.vue)
  ↓  useChapter() / useLesson() / useCourse() / useExercise()
Composable (app/composables/*.js)
  ↓  useAsyncData + $fetch('/api/**')
API Route (server/api/**/*.get.js)
  ↓  import { *Service } from '@ce'
Content Engine V1 (app/core/content-engine/)
  │  index.ts         → 唯一入口，对外暴露 Service 单例
  │  services/*Service.ts  → 业务编排，依赖 Repository 接口
  ↓  constructor({ repos }) 依赖注入（默认 @core/database/repositories 实例）
Repository Interface + Impl (app/core/database/repositories/*Repository.ts)
  │  唯一 import drizzle-orm 的位置
  │  get db() 懒加载模式
  ↓  eq / and / sql / .findMany() / .findFirst()
Drizzle ORM (app/core/database/connection.ts + schema.ts)
  ↓
Neon PostgreSQL (DATABASE_URL)
```

红线不变：Content Engine 零 Nuxt / 零 Vue / 零 Markdown Engine 依赖。

## 二、分层验证表

### 2.1 API 层（server/api/）—— 5 个文件，零 DB 直连

| API 文件 | 调用方式 | 是否直接 import Drizzle/db |
|---|---|---|
| `chapter/index.get.js` | `chapterService.list(courseSlug)` | ❌ 否（仅 `@ce`） |
| `chapter/[slug].get.js` | `chapterService.getBySlug(slug)` | ❌ 否（仅 `@ce`） |
| `lesson/[slug].get.js` | `lessonService.getBySlug(slug)` | ❌ 否（仅 `@ce`） |
| `course/index.get.js` | `courseService.list()` / `getBySlug()` | ❌ 否（仅 `@ce`） |
| `exercise/[slug].get.js` | `exerciseService.getBySlug(slug)` | ❌ 否（仅 `@ce`） |

验证命令（Grep）：`server/api/` 目录下无任何 `drizzle-orm` / `@core/database` / `import { db }` 命中，仅 5 处 `from '@ce'` 为合法访问。

### 2.2 Composable 层（app/composables/）—— 4 个文件，全走 API

| Composable 文件 | 数据获取方式 | 是否直连 DB / Repo / Service |
|---|---|---|
| `useChapter.js` | `useAsyncData + $fetch('/api/chapter...')` | ❌ 否，仅走 HTTP |
| `useLesson.js` | `useAsyncData + $fetch('/api/lesson/:slug')` | ❌ 否 |
| `useCourse.js` | `useAsyncData + $fetch('/api/course')` | ❌ 否 |
| `useExercise.js` | `useAsyncData + $fetch('/api/exercise/:slug')` | ❌ 否 |

前端接口签名保持稳定，与迁移前完全一致：

```js
const { chapters } = await useChapter()
const { lessons } = await useChapter(slug)
const { lesson } = await useLesson(slug)
const { courses } = await useCourse()
```

### 2.3 Content Engine Service 层（app/core/content-engine/services/）

| Service | 公开方法 | 依赖（Repository 接口） | 是否直接使用 Drizzle |
|---|---|---|---|
| `ChapterService` | `list(courseSlug?)` / `getBySlug(slug)` | `chapters`, `lessons`, `exercises` | ❌ 否，仅调 Repo 方法 |
| `LessonService` | `listByChapter(chapterSlug)` / `getBySlug(slug)` | `lessons`, `chapter` | ❌ 否 |
| `CourseService` | `list()` / `getBySlug(slug)` / `getTree(slug?)` | `courses`, `chapters`, `lessons` | ❌ 否 |
| `ExerciseService` | `listByChapter(chapterSlug)` / `getBySlug(slug)` | `exercises` | ❌ 否 |

Service 层仅做业务组装（例如 `getBySlug` = `repo.getBySlug` + `repo.listRelations`），参数归一化在 queries 层完成。

### 2.4 Repository 层（app/core/database/repositories/）—— 唯一数据库访问点

| Repository 实现 | Drizzle 操作封装 | 是否使用 `get db()` 懒加载 |
|---|---|---|
| `ChapterRepository` | `list` / `listByCourse` / `getBySlug` | ✅ 是 |
| `LessonRepository` | `listByChapter` / `getBySlug` | ✅ 是 |
| `CourseRepository` | `list` / `getBySlug` / `getWithChildren` | ✅ 是 |
| `ExerciseRepository` | `listByChapter` / `getBySlug` | ✅ 是 |
| `AssetRepository` | `list` / `getBySlug` | ✅ 是 |

全局 Grep 结果：**只有** `app/core/database/repositories/*.ts` 和 `app/core/database/connection.ts` 两个目录下的文件存在 `from 'drizzle-orm'` 导入；其他所有模块均零 drizzle 依赖。

## 三、红线与约束验证

| 红线条目 | 是否满足 | 证据 |
|---|---|---|
| Content Engine 不暴露 Repository 实例，仅暴露 Service | ✅ | `@ce` 入口 `index.ts` 仅 export `chapterService` / `lessonService` / `courseService` / `exerciseService`，无 `*Repository` 导出 |
| API 层禁止直接访问数据库 | ✅ | 见 §2.1，全走 `@ce`，零 drizzle/db 导入 |
| Repository 是唯一数据库入口 | ✅ | 见 §2.4，仅 `@core/database/repositories/*` + `connection.ts` 访问 drizzle |
| Content Engine 零 Nuxt/Vue/Nitro 依赖 | ✅ | `content-engine/` 下无 `nuxt` / `vue` / `h3` / `nitro` 导入（Grep 验证 0 命中） |
| Content Engine 零 Markdown Engine 交叉依赖 | ✅ | `content-engine/` 下无 `markdown-engine` 路径导入（Grep 0 命中） |
| Repository 使用 `db` getter 懒加载（避免模块顶层 env 未加载） | ✅ | 5 个 Repository 均采用 `private _db; get db() { if (!this._db) this._db = ...; return this._db }` 模式 |
| Drizzle schema / connection / repositories 统一在 `app/core/database/` | ✅ | `app/modules/` 与 `app/core/content-engine/` 下无任何 `.schema.ts` / `drizzle` 配置文件 |
| TypeScript 文件全部使用 `.ts` 扩展名（兼容 Windows drizzle-kit） | ✅ | `app/core/database/` 下 schema / repositories 全为 `.ts` |

## 四、旧数据访问代码清理

| 清理项 | 状态 | 说明 |
|---|---|---|
| `server/utils/db.ts`（遗留 `db` 单例导出） | ✅ 已删除 | 项目 Grep 0 引用，确认无任何模块依赖 |
| API 内 Drizzle 查询逻辑 | ✅ 已清理 | 所有 5 个 API 文件内 `db.query.*` 均替换为 `*Service.*` |
| 重复的 Service 定义 | ✅ 无残留 | 未发现除 `@ce/services/*` 之外的重复业务层定义 |

## 五、构建与类型验证

| 验证项 | 结果 | 执行命令 |
|---|---|---|
| TypeScript 类型检查 0 errors | ✅ 通过 | `npx tsc --noEmit` |
| Nuxt SSR 构建 | ✅ 通过 | `npm run build`（`✨ Build complete!` + Nitro `.output/server/index.mjs` 产出） |
| `.output/server/chunks/routes/api/**` 存在 | ✅ 通过 | chapter / lesson / course / exercise 4 类 API 路由均已编译打包 |

## 六、结论

Content Engine V1 已**真正落地**，成为应用层内容访问的唯一入口。迁移过程零前端 API 变动，零数据库结构变动，零功能新增，严格遵循「Migrate.md」第 258-271 行「本阶段不要做」条款（Cache / Search / CMS / Content Model 重构 / 前端结构 / DB 结构均未触及）。

完成后，Content Engine V1 才算真正落地。
