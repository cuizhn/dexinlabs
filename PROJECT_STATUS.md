# 德鑫实验室 · 项目状态

最后更新：2026-07-07

---
本文不是架构规范。

本文仅记录：

• 当前项目处于哪个阶段

• 已完成哪些工作

• 下一步开发目标

所有开发必须遵循：

DESIGN.md

ADR/

SPEC/

IMPLEMENTATION.md

## 一、当前阶段

**阶段 4/5 · DatabaseSource 落地 + Content v3 彻底移除 + Markdown/YML SoT Sync 已就位**

1. ✅ **阶段 1** — 项目基础设施（Nuxt 4 + JS 化 + 目录结构 + 路径别名）
2. ✅ **阶段 2** — 数据访问重构（Source/Adapter/Query 三层落地 + `queryCollection` 未定义问题根治）
3. ✅ **阶段 3** — Content Engine 8 层高内聚骨架（Contracts + Core + Source/Loader/Parser/Transformer/Renderer）
4. � **阶段 4** — 自研 Markdown 渲染（已完成"去掉 Nuxt ContentRenderer"，真正 AST Parser + Prose 组件族未开始）
5. ✅ **阶段 5（数据侧）** — DatabaseSource 落地 + 完全卸载 `@nuxt/content` + 文件系统退出运行时角色、改为唯一内容源（Source of Truth）通过 `npm run sync` 同步到 Neon

---

## 二、已完成项

### P0 · 基础 & 稳定性

| 项 | 状态 | 关键交付 |
|---|---|---|
| 全项目 TypeScript → JavaScript 迁移 | ✅ | 所有 .ts 文件删除，统一使用 .js/.vue |
| 去除所有代码注释 & 格式化 | ✅ | |
| 按 jiagou.md 模块化目录结构建立 | ✅ | `app/modules/`、`app/shared/`、`standards/` 就位 |
| 修复 `loadChapter is not defined` | ✅ | 页面引入 `useChapter` composable |
| 修复 `queryCollection is not defined` | ✅ | Adapter 迁移到 `server/utils/contentAdapter.js`（Nitro auto-import） |
| 修复构建 `Entry module cannot be external` | ✅ | `modules/shared` 移入 `app/` + Vite SSR noExternal 调整 |
| 修复 CSS 路径报错 | ✅ | `nuxt.config.js` css 字段改为 `~/app/assets/css/main.css` |
| 路径别名配置 | ✅ | `@modules`、`@shared`、`@standards`、`~/` 全部可用 |
| `npm run build` 持续绿 | ✅ | 2.97 MB / 727 KB gzip（vercel preset），0 错误 |

### P1 · 运行时数据链路重构（阶段 2→5 一体化）

| 项 | 状态 | 关键交付 |
|---|---|---|
| Prisma → Drizzle ORM 替换 | ✅ | 卸载 `prisma`/`@prisma/client`/`@prisma/adapter-neon`；引入 `drizzle-orm`/`drizzle-kit`；保留 `@neondatabase/serverless` |
| Drizzle schema + migrations 体系 | ✅ | [drizzle/schema.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/schema.js) 五表（courses/chapters/lessons/exercises/assets）+ 关系 + 索引；[drizzle.config.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle.config.js)；package.json 新增 `drizzle:generate/migrate/push/studio/check` 命令 |
| 统一 DB 工厂（运行时 + CLI 共用） | ✅ | [drizzle/db.js](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/db.js) createDb/getDb/closeDb + Proxy 单例；[server/utils/db.js](file:///C:/Users/cui/Documents/www/dexinlabs/server/utils/db.js) Nitro auto-import `useDb()` |
| 五层调用链：Page → Composable → API → Service → Repository → Drizzle → Neon | ✅ | 严格分层，每一层仅依赖下一层 |
| Repository 层（纯 CRUD） | ✅ | [repositories/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/repositories) Course/Chapter/Lesson/Exercise/Asset 五 Repository，每类均含 list/getBySlug/getById/count/create/updateBySlug/upsert/deleteBySlug，并提供 listByCourse/listByChapter/getOneByChapter 集合查询 |
| Service 层（业务聚合） | ✅ | [services/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/services) CourseService（Course → Chapters → Lessons 树）/ChapterService（{chapter,lessons,exercise}）/LessonService（{...lesson, chapter}）/ExerciseService |
| 5 条 server/api/* 改造为仅调用 Service | ✅ | [server/api/course/index.get.js](file:///C:/Users/cui/Documents/www/dexinlabs/server/api/course/index.get.js) / chapter list / chapter [slug] / lesson [slug] / exercise [slug]，任何一条均不再直接访问 DB |
| Loader 层同步对接 Service | ✅ | loader/course.js / loader/chapter.js / loader/lesson.js 从硬 import source/database/* 改为调用 CourseService/ChapterService/LessonService，对外签名（__loadedBy/__source/lessonsMap）100% 兼容旧实现 |
| DatabaseSource 真实现（Drizzle 版） | ✅ | [source/database/DatabaseSource.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/source/database/DatabaseSource.js) findOne/findAll/count 三方法 Drizzle 原生 select/where/orderBy/limit/offset/count(*) 落地；COLLECTION_TO_TABLE 五张表映射；完全实现 SourceContract |

### P2 · Content Engine & 渲染系统（阶段 3→4 推进）

| 项 | 状态 | 关键交付 |
|---|---|---|
| 8 层 Contracts + Core + Registry + Pipeline | ✅ | 已在前一轮落地 |
| Transformer 7 个独立模块（heading/toc/links/excerpt/readingTime/reference + math 预留） | ✅ | 已在前一轮落地 |
| Nuxt ContentRenderer 依赖移除 | ✅ | [MarkdownRenderer.vue](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/renderer/theme/MarkdownRenderer.vue) 彻底去掉 `<ContentRenderer>` fallback 分支；引入 `marked` 做基础 MD → HTML + `v-html` 渲染；GFM + breaks + headerIds 开启 |
| `@nuxt/content` 模块彻底卸载 | ✅ | package.json 移除；nuxt.config.js 去掉 modules 项 + content 配置块；卸载连带 better-sqlite3/rehype-katex/remark-math；删除 content.config.js、server/utils/contentAdapter.js、旧 source/content-v3/*、旧 nuxtContentV3Source.js、旧 source/database/* 四 collection 函数文件 |

### P3 · 内容源模式（核心架构升级）

| 项 | 状态 | 关键交付 |
|---|---|---|
| Markdown/YML Source of Truth 确立 | ✅ | `content/` 目录保留且仅保留：不做任何运行时读、不被 Nuxt build 期索引、不参与 SSR；唯一角色是"编辑 + Git 版本管理 + AI 协作 + 多人协作真源" |
| Neon 确立为"运行时数据库"角色 | ✅ | 高效索引、关联查询（课程→章节→课时→练习）、未来用户/进度/提交体系存储；可随意换库只需跑一次同步 |
| 幂等同步脚本 `npm run sync` | ✅ | [content/sync.js](file:///C:/Users/cui/Documents/www/dexinlabs/content/sync.js)：① auto-load 根 .env → ② glob 扫描三类文件（content/course/**/*.yml、content/chapter/**/*.yml、content/lesson/**/*.md）→ ③ js-yaml 解析 YAML（.yml）或正则+js-yaml 解析 Markdown frontmatter → ④ slug onConflictDoUpdate 调用对应 Repository upsert（幂等）→ ⑤ closeDb 关 Neon Pool → ⑥ 控制台打印 scanned/upserted/skipped/errors 汇总及每类明细 |

---

## 三、进行中

| 项 | 进度 | 阻塞点 |
|---|---|---|
| **自研 Markdown 真解析**（micromark/mdast AST + Prose 组件族） | 0%（仍停留在 marked passthrough HTML 阶段） | 优先级待定（基础 MD 能跑即可，后续可平滑替换） |
| **Exercise/Asset 的 Markdown SoT 同步逻辑补全** | 0% | 本轮只做了 Course/Chapter/Lesson 三类同步，Exercise 只能 DB 编辑，Asset 完全未处理（等你定要不要也走 Markdown/YAML SoT） |
| **内容回填**：已有 content/ 目录实际内容检查 + npm run sync 试跑 | 0% | 需确认 content/course / content/chapter / content/lesson 下的文件是否已经写好（目前 sync 逻辑是 0 文件 0 upsert，完全幂等） |
| **首次建表**：`drizzle:push` 或 `drizzle:generate + drizzle:migrate` 实际把五张表建到 Neon | 0% | 未执行过任何 drizzle kit 命令，构建能过但 Neon 端目前应该是无表状态（查询会直接查空，sync 会报错） |

---

## 四、下一目标（按优先级）

### 立即（本轮交付落地后的第一件事）

1. **首次把表推到 Neon**：`npm run drizzle:push`（快速建表，非正式迁移）或者 `npm run drizzle:generate` → `npm run drizzle:migrate`（正式迁移，生成 drizzle/migrations SQL）
2. **检查 content/ 实际内容 + 跑一遍 sync**：`npm run sync`，看控制台输出 scanned/upserted/errors，确认已写的 Markdown/YAML 能被正确识别字段并写进 Neon
3. **lesson/exercise 页面实际跑通走数据库**：`npm run dev`，打开 `/course/[chapter]/[lesson]` 和 `/exercise/[chapter]` 两个页面验证数据能从 Neon → Drizzle → Repository → Service → API → Composable → Page → marked 渲染全链路展示出来

### 中期（P3 补齐）

4. **Exercise 的 Source of Truth 方案确认**：继续走 DB 编辑 → 保持现状即可；改走 Markdown/YAML → 写 `content/exercise/**/*.md` + sync.js 加 exercise 扫描分支
5. **Asset 方案确认**：走 content/assets/yml + sync.js 上传到 CDN（如 R2/OSS）写回 url；或完全 DB 记录
6. **真正 AST Parser + 递归 Prose 组件替换 marked + v-html**：parser/markdown.js 落地 micromark（或 markdown-it）+ mdast；新增 ProseH1~H6/ProseP/ProseUl/ProseCode/ProseBlockquote 独立 Vue 组件；RenderedNode 递归渲染；为将来 inline math/自定义 callout 做准备

### 长期（工程化收尾）

7. CI：`.github/workflows`（或 Vercel Pipeline）build 前先 `drizzle:migrate` 自动迁移 + `sync --check` 校验 content/ 语法
8. **CMSSource 接 Strapi/Payload（如需要）**：[CMSSource.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/source/cms/CMSSource.js) 仍为预留实现
9. 课程/章节/课时增删改后台：可选（如果坚持 SoT = 代码仓 Markdown，则增删改走 MR 流程，不需要后台）

---

## 五、里程碑

| 里程碑 | 目标 | 预计交付 |
|---|---|---|
| M1（已到） | Content Engine 8 层骨架 + Database/CMS 接口预留 + Nitro 构建 0 错误 | ✅ 2026-07-07 早 |
| M2（已到） | Prisma → Drizzle + 五层严格分层 + 卸载 @nuxt/content + 运行时只走 Neon | ✅ 2026-07-07 晚 |
| M3（已到） | Markdown/YML Source of Truth 确立 + `npm run sync` 幂等同步 | ✅ 2026-07-07 晚 |
| M4 | 首次真实内容跑通（drizzle:push → npm run sync → 页面可见 lesson/exercise） | 下一次动手 |
| M5 | 自研 AST Parser + 递归 Prose 组件族，移除 marked + v-html | 待定 |
| M6 | Exercise/Asset SoT 补齐 + CI 自动迁移 + 构建校验 | 待定 |

Current Sprint

三件事（按顺序）：

1. **建表到 Neon**：`npm run drizzle:push` 或 `generate/migrate`
2. **检查并同步内容**：`npm run sync` 看明细，根据报错修 frontmatter 字段
3. **本地页面跑通全链路**：`npm run dev`，lesson 与 exercise 页面均能正常显示正文（marked 渲染）

完成标准：

✓ Neon 控制台能看到五张表（至少 courses/chapters/lessons 有数据）

✓ `npm run sync` 扫描 ≥ 1 个 md/yml 文件，upserted 计数 ≥ 1

✓ lesson 页面可打开，显示正文标题段落

✓ exercise 页面可打开（若 content/exercise 已有内容则同步）

✓ 不修改 Contracts

✓ 不修改 Pipeline

✓ build 通过

本阶段禁止：

× 回退 Prisma

× 回退到 `@nuxt/content`

× 在 server/api/* 中直接 useDb / useXxxRepository（必须走 Service）

× 让运行时代码直接读 content/ 目录
