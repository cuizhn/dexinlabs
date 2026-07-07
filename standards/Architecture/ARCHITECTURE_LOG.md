# 架构决策与演进记录

> 记录每一次"为什么这么改"，以及"改了什么具体点"，避免未来推翻重来时忘记取舍理由。

---

## 决策 13（2026-07-07）· 内容采用 Markdown/YML Source of Truth + npm run sync 幂等同步到 Neon（数据库只做运行时查询）

### 为什么改
- 直接把课程/章节/课时的正文写进数据库（或用 DB CMS 后台改）有三个长期痛点：
  1. 内容版本管理困难：DB 内容 diff 难、AI 批量改写 commit 难、多人协作 review 难
  2. 迁移不自由：换 DB / 换 CMS 要重新 dump+import，且业务耦合深
  3. Markdown/YAML 本来就是内容天然格式：VS Code/Obisidian/Typora/AI 都能直接改，Git 是世界上最好的版本管理工具
- 但文件系统（Content v3）直接做运行时源有两个硬伤：
  1. 关联查询（课→章→节→练习→用户进度→提交）必须走 DB 索引，fs 根本做不动
  2. 搜索、分页、权限过滤、推荐都依赖关系型查询，fs 只能暴力扫描
- 所以采用"文件 = 唯一真源 + 数据库 = 运行时索引"的经典双写架构（类似 Hugo/Jekyll + Algolia，只是把 Algolia 换成 Neon），两边各自发挥长处。

### 改了什么
- 角色分工确定：
  - **Source of Truth（真源，唯一可写）**：`content/course/**/*.yml`、`content/chapter/**/*.yml`、`content/lesson/**/*.md`（可选 `content/exercise/**/*.md`、`content/assets/**/*.yml`）
  - **运行时只读副本（查询优化层）**：Neon Postgres 的 5 张表 courses/chapters/lessons/exercises/assets，内容必须完全由同步脚本产生
- 新增 [content/sync.js](file:///C:/Users/cui/Documents/www/dexinlabs/content/sync.js)（纯 Node 运行，`npm run sync`，不依赖 Nuxt/Nitro/Vite）：
  1. 自动读项目根 `.env` 拿 `DATABASE_URL`（兼容裸 node 执行和 npm 脚本）
  2. `fast-glob` 扫 3 类文件模式
  3. `js-yaml` 解析 yml 或正则 `^---\n(frontmatter)\n---\n(body)` 切 md 文件，frontmatter 再次走 js-yaml
  4. slug 为唯一键：Repository `upsert`（Drizzle `insert ... onConflictDoUpdate` target=slug）—— **幂等**，文件改多少次、同步多少次都是安全的，不会产生重复数据
  5. 结束调用 `closeDb()` 关 Neon Pool，防止 Node 进程挂住不退出
  6. 最后打印汇总：`scanned / upserted / skipped / errors` 四计数 + 每类分表 OK / skipped / errors 明细行
- **硬性架构规则**：
  - 所有运行时代码（SSR server routes / Service / Repository / Loader / Engine）**绝对禁止**读 content/ 目录的 fs、**绝对禁止**用 @nuxt/content 之类的 fs 索引器
  - 真源写操作只能在 VS Code / AI 改 Markdown/YAML，走 Git MR/commit；同步只能由开发/CI 执行 `npm run sync`；Neon 里课程/章节/课时/练习表**业务层只写 DB side effect（用户进度等）**，绝不能 overwrite `body/title/slug/order` 这些来自 Markdown 的字段（否则下次同步会被覆盖）
- package.json scripts 新增：`"sync": "node content/sync.js"`

### 权衡
- **优点**：内容自由、Git 可审计、AI 批量改写零成本、换库只需 `npm run sync` 重放、Vercel Build 不需要 fs 索引（Content v3 构建期扫盘时间去掉）
- **代价**：每次改 Markdown 后必须跑一次同步，数据库和真源之间存在 1 个"同步动作"滞后；相比纯数据库编辑多一道工序
- **为什么没用 `nuxi content` / Nuxt Content v3 的内置同步**：v3 已经彻底卸载，且同步逻辑是业务强相关的字段映射（frontmatter title/slug/chapter → SQL 列），必须用代码显式维护，不能靠隐式映射

---

## 决策 12（2026-07-07）· 严格五层调用链：Page → Composable → API → Service → Repository → Drizzle → Neon

### 为什么改
- 之前尝试过两套方案，都存在越权访问和单点改全身的问题：
  1. **旧三层 API/Repository/Composable**：旧 Repository 混 queryCollection + 缓存 + 权限，SSR/Client 边界不清；Composable 还会跨 import（Lesson 页面 import useChapter）
  2. **Source/Adapter/Loader/Engine 新三层**：Loader 直接 import Source 的 collection 纯函数，虽然职责拆清了，但业务聚合（比如 Course→Chapters→Lessons 嵌套）散落在 Loader 与 Source 之间，无法复用；同时 server/api/* 直接用 `usePrisma()` 跳过了所有中间层，变成"DB 直通 handler"，未来要加缓存/鉴权/审计会每个 handler 全改一遍
- 必须引入 **Repository（单集合纯 CRUD） + Service（跨集合业务聚合）** 两个明确的服务端层，并且把调用顺序严格锁死

### 改了什么
- **调用方向唯一向下，禁止反向或跳跃**：
  ```
  Page (Vue SFC)
    ↓
  Composable (useCourse / useChapter / useLesson / useExercise，内部 useAsyncData + $fetch)
    ↓
  server/api/* (Nitro 路由，参数校验 + createError；除了调用 Service 外不写任何业务)
    ↓
  Service (CourseService / ChapterService / LessonService / ExerciseService，跨 Repository 组合成 loader 需要的返回结构)
    ↓
  Repository (每表一个：单集合 CRUD + 典型过滤查询，绝不跨表)
    ↓
  Drizzle (sql 语法糖，绝不写裸 pg)
    ↓
  Neon (Postgres Pool @neondatabase/serverless)
  ```
- 新增目录：
  - [app/modules/content/repositories/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/repositories)（5 个，五张表各一个，含 index.js 统一导出）—— 纯 CRUD，upsert 逻辑放在 Repository 保证 Service 写表时都经过同一 slug 冲突处理
  - [app/modules/content/services/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/services)（4 个，Course/Chapter/Lesson/Exercise，含 index.js 统一导出）—— 业务聚合：`CourseService.getDefault` 直接返回 Course 树；`ChapterService.getBySlug` 返回旧版 API 要求的 `{chapter,lessons,exercise}`；`LessonService.getBySlug` 返回 `{...lesson, chapter}`；Service 只调 Repository，绝不直连 DB
- server/api/* 全部改造完成：**0 个 handler 直接 useDb 或 useXxxRepository**，5 个路由分别调用对应 Service 的方法，参数/404 校验与原来一模一样，所以 Page/Composable 不需要任何改动（API 输出结构保持不变）
- Content Engine 的 [loader/course.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/loader/course.js) / [loader/chapter.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/loader/chapter.js) / [loader/lesson.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/loader/lesson.js) 也改为调用对应 Service，保持对外返回 `__loadedBy / __source / lessonsMap` 等签名不变，Engine 层完全无感

### 权衡
- **优点**：每一层职责单一，未来加任意横切关注点（鉴权/缓存/审计/分库）只改一层：
  - 要加 Redis 读缓存 → 加在 Repository 外层
  - 要加课程可见性权限 → 加在 Service 外层
  - 要加 API 限流 → 加在 server/api/* 中间件层
  - 要切换 DB → 只改 Repository 实现（Drizzle→Knex→Baremql），Service 以上零改动
- **代价**：增加两层"样板"文件，新表要同时建 Repository + Service；对于 5 张表的小项目是小成本，但长期看是 1:1 收益的架构投资

---

## 决策 11（2026-07-07）· Prisma ORM → Drizzle ORM 替换

### 为什么改
- Prisma 在本项目中已经暴露四个长期不可回避的坑：
  1. **Prisma 7 强制 schema url 字段废弃**：必须把 `datasource.url` 从 schema.prisma 移到 `prisma.config.js` defineConfig，导致"schema + 配置双文件"认知负担，且与官方文档默认写法不一致，新成员上手踩坑成本高
  2. **Prisma Client 代码生成前置**：dev/build 前必须 `prisma generate`，CI 慢、冷启动慢；每次 schema 变动如果漏跑 generate 就报一堆类型错误（虽然我们用 JS，但生成代码本身仍是强依赖）
  3. **better-sqlite3 强制依赖的连锁反应**（Prisma → @nuxt/content → better-sqlite3）：better-sqlite3 需要 native 编译，Vercel / Alpine Docker 环境会偶发编译失败，构建时要带 binary 镜像，工程复杂度陡增
  4. **SQL 黑盒**：复杂 join / with / upsert returning / 窗口函数在 Prisma 中要么写得别扭，要么必须 `$queryRaw` 退回到裸 SQL；而我们同步脚本刚好需要大量 `onConflictDoUpdate`（upsert）+ relation 反查，Drizzle 的 "SQL 语法糖但不失控" 心智更匹配
- 选型三选一（Prisma / Drizzle / Kysely）：
  - Prisma 上面列的坑命中全部
  - Kysely 没有官方 neon 驱动集成，需要自己写 Pool + 适配器，查询 builder 心智略低于 Drizzle
  - Drizzle：官方支持 `drizzle-orm/neon-serverless`，驱动复用已有的 `@neondatabase/serverless` Pool；migration/diff/push/check 工具链齐全（`drizzle-kit`），且 **CLI 与运行时完全解耦（不需要生成 Client，schema.js 就是运行时类型依据）**

### 改了什么
- 卸载：`prisma` / `@prisma/client` / `@prisma/adapter-neon`
- 新增：`drizzle-orm`（运行时） + `drizzle-kit`（dev CLI）
- 保留：`@neondatabase/serverless`（Drizzle neon-serverless 驱动直接复用 Pool）
- schema 迁移：Prisma 5 表模型（Course/Chapter/Lesson/Exercise/Asset）→ [drizzle/schema.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/schema.js) 显式 5 表 + relations + uniqueIndex/index + createdAt UTC now 默认 + updatedAt onUpdate hook（JS 属性名驼峰，SQL 列名 snake_case）
- 配置迁移：[drizzle.config.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle.config.js)（ESM，自动读 process.env.DATABASE_URL），schema 路径指向 drizzle/schema.js，out 指向 drizzle/migrations
- 单例/连接池：
  - [drizzle/db.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/db.js)：`createDb(opts)`（自定义 Pool/url）、`getDb()`（单例，lazy init）、`closeDb()`（Pool.end）、`db` Proxy（隐式 lazy getDb）+ re-export 全部 schema 便于解构
  - [server/utils/db.js](file:///C:/Users/cui/Documents/www/dexinlabs/server/utils/db.js)：Nitro auto-import 包装，暴露 `useDb()`；运行时同步脚本和 server 端共用 drizzle/db.js
- package.json scripts：去掉 6 个 `prisma:*` 命令，新增 `drizzle:generate / drizzle:migrate / drizzle:push / drizzle:studio / drizzle:check` + `sync`（content/sync.js）
- 删除遗留：`prisma/` 整个目录、`prisma.config.js`、`server/utils/prismaClient.js`、旧 [app/modules/content/source/database/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/source/database) 下四个 collection 纯函数（course/chapter/lesson/exercise.js）
- Content Engine DatabaseSource 同步重写：[DatabaseSource.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/source/database/DatabaseSource.js) 三方法（findOne/findAll/count）从"throw NotImplemented"→ 直接 drizzle select/where/orderBy/limit/offset/count(*)，COLLECTION_TO_TABLE 映射五张表，保证 Source 层的实现与 Repository 用同一个 schema 定义

### 权衡
- **优点**：
  1. 构建期零生成：build/dev 不再有 generate 前置，冷启动更快
  2. SQL 透明可控：所有查询 drizzle 只是 builder，实际 SQL 可直接 `toSQL()` 打印，排查慢查询比 Prisma 省一半时间
  3. 驱动复用：`@neondatabase/serverless` Pool 直接用，没有额外 adapter 包装层
  4. 生态零 native 依赖：Drizzle 纯 JS，drizzle-kit 也是 JS CLI，不存在 better-sqlite3 / prisma query engine binary 的编译问题，Vercel / Edge / Bun / Deno 都能跑
- **代价**：
  1. 相比 Prisma 的 `include` 声明式 join，Drizzle 多表 join 要自己写 `leftJoin` + select 字段，稍微啰嗦一点（可用 `relations` API 简化）
  2. schema 写法：必须熟悉 Drizzle 的 pg-core column builder 系列 API（serial/varchar/text/integer/timestamp/uniqueIndex），但对长期维护是好事——不再有 Prisma 特有的隐式黑盒

---

## 决策 10（2026-07-07）· Content Engine 8 层结构 + Contracts 契约驱动

### 为什么改
- 此前代码已经分了"Source / Adapter / Query"三层，但**长期缺少统一渲染框架**，`@nuxt/content` 的 `<ContentRenderer>` 是黑盒，后续换 Markdown 实现（remark/micromark/markdown-it）和换数据源（文件→数据库→CMS）都会导致全局大改。
- 参考 [content-engine.md](file:///c:/Users/cui/Documents/www/dexinlabs/content-engine.md) 定义："任何技术（Content v3、Markdown、数据库、CMS）都只是一个数据源，不是系统本身"，所以必须引入 **Contracts 契约层** 先锁死接口，再让各层实现。

### 改了什么
- 新增 `app/modules/content/contracts/` 6 大契约：`Source` / `Loader` / `Parser` / `Transformer` / `Renderer` / `Query`，每个文件只写签名 + `assert*Contract` 校验，**零实现代码**。
- 新增 `core/registry.js` 作为统一注册中心：所有 Source/Parser/Transformer/Renderer/Query 都在 boot 时注册到 registry，Engine 不再硬依赖具体实现。
- 新增 `core/pipeline.js` 固定流水线：**Parse → Transform (按 order 排序) → Render**，任何增强都只能写新 Transformer 注册进来，不允许改 Parser。
- 新增 `core/engine.js` 统一门面：`getContentEngine().getChapter(slug, opts)`、`.pipe(content, opts)` 等，以后 Page 只认 Engine，不碰具体层。
- 新增 `plugins/content-engine.client.js` / `.server.js` 把 `$contentEngine` / `$contentQuery` 注入到 NuxtApp 全局。

### 权衡
- **短期写了 25+ 新文件**（骨架），但未来切换 DB / CMS / Parser **仅改对应 Source 或 Parser 的实现文件，上层零改动**。
- 选择了"Nuxt ContentRenderer fallback"策略在 `MarkdownRenderer.vue`：短期内页面仍然走 Nuxt 渲染保证线上可用，替换时只改 Renderer 内部实现。

---

## 决策 9（2026-07-07）· Database / CMS Source 预留占位实现

### 为什么改
- 架构文档的核心诉求是"**逐步替代 content v3 文件系统**"。如果现在不把接口预留出来，日后接数据库时会重新动到 Engine/Loader/Query 三层，违反契约驱动原则。

### 改了什么
- 新增 `app/modules/content/source/database/DatabaseSource.js`：实现 SourceContract 三方法（findOne/findAll/count），但方法体统一 `throw NotImplemented`，并把**预期的入参签名**写在错误信息里，下一步接 ORM 只要替换 throw。
- 新增 `app/modules/content/source/cms/CMSSource.js`：同样策略，为 Strapi/Payload/Sanity 预留，并注释 `this.api.fetch(\`/api/${collection}/${slug}\`)` 的接入点。
- 新增 `source/index.js`：`createSource(type, deps, opts)` 工厂 + `SOURCE_TYPES` 枚举，`type ∈ {nuxt-content-v3, markdown, database, cms}`。

### 权衡
- 不直接引入数据库驱动/ORM 依赖，保持当前构建零新包。

---

## 决策 8（2026-07-07）· Loader 单独拆一层（Source 不做业务聚合）

### 为什么改
- 之前 `source/content-v3/chapter.js:getChapterBySlug()` 里同时查 chapter + exercise，`lesson.js:getLessonBySlug()` 里同时查 lesson + chapter——这些是**业务关联聚合，不是纯数据抓取**，违反 Source"只取内容"的单一职责，后续换 DatabaseSource 时必须把这些逻辑再复制一遍。

### 改了什么
- 新建 `loader/`：
  - `loader/course.js`：`loadCourse(slug)` → 组装 Course Tree（Course → Chapters → Lessons 嵌套）
  - `loader/chapter.js`：`loadChapter(slug)` → Chapter + Exercise + Lessons
  - `loader/lesson.js`、`loader/asset.js`
- Source 层保持"单集合查询纯函数"（`source/content-v3/*.js` 不改内容），被 Loader import 复用。

---

## 决策 7（2026-07-07）· 轻量 Frontmatter 解析，不引入 gray-matter

### 为什么改
- Parser 写骨架时最初打算 `import matter from 'gray-matter'`，结果 `package.json` 没有此依赖；项目已经是 Nuxt 4 大依赖集合，**避免装包+增加构建体积**。
- 当前 frontmatter 只含简单 `key: value`（无嵌套 YAML、数组用得少），自写 20 行解析器覆盖 90% 场景，未来可平滑替换到 gray-matter/js-yaml。

### 改了什么
- 新增 `parser/frontmatter.js:parseFrontmatter(raw)`，手写 `---` 分隔符 + `key: value` 分割，仅支持字符串标量。
- `parser/markdown.js` 改为复用 `parseFrontmatter`，不装新包。

---

## 决策 6（2026-07-07）· Transformer 7 个独立文件 + registry order 排序

### 为什么改
- "增强逻辑散落在 Parser 里"是未来最容易失控的地方（TOC/Heading ID/Link 改写/Excerpt/Reading Time/Math 各写各的，互相覆盖）。
- content-engine.md 明确要求 Transformer 是"系统以后最重要一层"。

### 改了什么
- `heading.js`、`toc.js`、`links.js`、`excerpt.js`、`readingTime.js`、`reference.js` 6 个独立文件 + `registerTransformer(name, impl, order=100)` 注册时带 order。
- `pipeline.js` 按 `order` 升序执行 Transformer（heading→toc→links→excerpt→readingTime→reference），保证 TOC 依赖 Heading ID 注入完成。

---

## 决策 5（2026-07-07 前后）· `contentAdapter.js` 移入 `server/utils/`

### 为什么改
- 之前放 `app/modules/content/adapter/contentAdapter.js`，运行时 **ReferenceError: queryCollection is not defined**。根因：Nuxt Content 的 `queryCollection` 是 **Nitro unimport** 注入，**只扫描 `server/` 目录**，`app/` 下的文件不在扫描范围。
- 这是本项目最容易反复踩的坑，必须在架构日志里明确规则。

### 改了什么
- 迁移到 `server/utils/contentAdapter.js`：Nitro 自动把该文件导出的 `createContentAdapter` auto-import 到所有 `server/api/*` 路由。
- 5 个 API 路由删除显式 import，只保留 Source 函数 import。
- **架构规则新增一条**：凡是直接调用 `queryCollection()` 的代码 → **必须**放在 `server/utils/` 或 `server/plugins/` 或 `server/middleware/` 下，**严禁**放在 `app/`。

---

## 决策 4 · modules/shared 移入 `app/` 目录

### 为什么改
- 原放在项目根 `modules/`、`shared/`，Nuxt 4 build 阶段将其视为 node_modules 外部依赖，报 `Entry module cannot be external`。

### 改了什么
- 统一迁入 `app/modules/`、`app/shared/`，`nuxt.config.js` 的 `alias`、`imports.dirs`、`components.dirs` 全部指向 `~/app/...`。

---

## 决策 3 · 旧三层（API/Repository/Composable）→ 新三层（Source/Adapter/Query）

### 为什么改
- 旧 Repository 里混用了"调 queryCollection + 业务缓存 + 权限判断"，三类职责耦合，SSR/Client 边界不清。
- 原 Composable 两步调用：`const { loadChapter } = useChapter(); await loadChapter(slug)`——心智负担重，且页面里跨 composable 引用（Lesson 页面 import useChapter）。

### 改了什么
- Source：纯函数"单集合数据抓取"，**从不依赖 Nuxt Context**（依赖传进来的 adapter）。
- Adapter：集中一处 `queryCollection(event)`，唯一 Nitro 上下文耦合点。
- Query：`await useChapter(slug)` 单调用，内部 `useAsyncData`。Lesson 的事情由 Lesson Query 解决，不再跨 Composable import。

---

## 决策 2 · 全项目 TS → JS

### 为什么改
- 用户明确要求："不再使用 ts 语法，请全项目修改"。
- 教育项目以内容迭代为主，频繁改 schema 时 TS 类型声明是维护负担。

### 改了什么
- 所有 `.ts` 删除，改成 `.js`；tsconfig 相关清理；`defineProps`/`defineEmits` 保留在 Vue SFC 里（语法有效，不引 TS 类型）。

---

## 决策 1 · Nuxt 4 + Nitro + Nuxt Content v3 为初始技术栈

### 为什么改
- 初始项目就是 Nuxt Content，Markdown/YML 内容能 0 成本上手，SEO 友好。
- Nitro server routes 写 API 就是文件，零样板。

### 后续演进路径（本项目的全部决策围绕它）
- 文件 → Content v3 Adapter → **Contracts 锁定接口** → DatabaseSource / CMSSource 替换 → 最终移除 Nuxt Content 依赖。
