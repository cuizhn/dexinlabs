# 德鑫实验室 · 项目状态

最后更新：2026-07-08

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

**阶段 5/6 · 全链路 TypeScript 化 + 数据源清理 + ADR0709 v2 架构重构方案定稿（待实施）**

1. ✅ **阶段 1** — 项目基础设施（Nuxt 4 + JS 化 → 再次 TypeScript 化 + 目录结构 + 路径别名）
2. ✅ **阶段 2** — 数据访问重构（Source/Adapter/Query 三层落地 + `queryCollection` 未定义问题根治）
3. ✅ **阶段 3** — Content Engine 8 层高内聚骨架（Contracts + Core + Source/Loader/Parser/Transformer/Renderer）
4. ⚠️ **阶段 4** — 自研 Markdown 渲染（已完成"去掉 Nuxt ContentRenderer"，真正 AST Parser + Prose 组件族未开始）
5. ✅ **阶段 5（数据侧）** — DatabaseSource 落地 + 完全卸载 `@nuxt/content` + 文件系统退出运行时角色、改为唯一内容源（SoT）+ `npm run sync` 幂等同步到 Neon + Vercel 部署 500 根治（Drizzle db Proxy 懒加载）
6. 📐 **阶段 6（架构设计侧）** — ADR0709 v2 架构非破坏性重构方案定稿（去 modules + Core/Boot/Data/Render/Shared 五域 + 去 Content 命名 + Query 回归 Nuxt composables/），待平静窗口一次性迁移实施

---

## 二、已完成项

### P0 · 基础 & 稳定性

| 项 | 状态 | 关键交付 |
|---|---|---|
| 全项目 TypeScript → JavaScript 迁移（第一轮回退） | ✅ | 所有 .ts 文件删除，统一使用 .js/.vue |
| JS → TypeScript 第二轮回迁（类型安全优先） | ✅ | contracts/core/registry/repositories/services/drizzle/bootstraps/loader/server/utils 全量 TS 化，`npx nuxi typecheck` 0 错误 |
| 去除所有代码注释 & 格式化 | ✅ | |
| 按 jiagou.md 模块化目录结构建立 | ✅ → ⚠️ 待 ADR0709 迁移 | `app/modules/`、`app/shared/`、`standards/` 就位（modules/ 按 ADR0709 待拆除） |
| 修复 `loadChapter is not defined` | ✅ | 页面引入 `useChapter` composable |
| 修复 `queryCollection is not defined` | ✅ | Adapter 迁移到 `server/utils/contentAdapter.js`（Nitro auto-import） |
| 修复构建 `Entry module cannot be external` | ✅ | `modules/shared` 移入 `app/` + Vite SSR noExternal 调整 |
| 修复 CSS 路径报错 | ✅ | `nuxt.config.js` css 字段改为 `~/app/assets/css/main.css` |
| 路径别名配置 | ✅ → ⚠️ ADR0709 后加 5 新别名 | `@modules`、`@shared`、`@standards`、`~/` 全部可用；待加 `@core/@boot/@data/@render/@shared` 五新域别名 |
| `npm run build` 持续绿 | ✅ | 2.97 MB / 727 KB gzip（vercel preset），0 错误 |
| Vercel 部署 500 错误根治（db 过早初始化） | ✅ | [drizzle/db.ts](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/db.ts) 改为 Proxy 包装 db 实例 + Repository 改用 `_getDb()` 方法代替 getter，防止 Rollup 优化内联导致环境变量未加载 |
| 架构文档 & ADR 体系建立 | ✅ | [docs/ADR/adr0708.md](file:///C:/Users/cui/Documents/www/dexinlabs/docs/ADR/adr0708.md)（目录快照）、[docs/ADR/adr0709.md](file:///C:/Users/cui/Documents/www/dexinlabs/docs/ADR/adr0709.md) v2（重构方案，100% 采纳第二轮 8 条评审） |

### P1 · 运行时数据链路重构（阶段 2→5 一体化）

| 项 | 状态 | 关键交付 |
|---|---|---|
| Prisma → Drizzle ORM 替换 | ✅ | 卸载 `prisma`/`@prisma/client`/`@prisma/adapter-neon`；引入 `drizzle-orm`/`drizzle-kit`；保留 `@neondatabase/serverless` |
| Drizzle schema + migrations 体系（TS 化） | ✅ | [drizzle/schema.ts](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/schema.ts) 五表 + 关系 + 索引；[drizzle.config.ts](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle.config.ts) defineConfig；schema 用 `.ts` 扩展名解决 Windows drizzle-kit 识别问题；package.json 新增 5×drizzle 命令 |
| 统一 DB 工厂（运行时 + CLI 共用，Proxy 懒加载） | ✅ | [drizzle/db.ts](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle/db.ts) DATABASE_URL 空值校验 + Proxy 包装（延迟到调用时初始化，根治 Vercel 500）；[server/utils/db.ts](file:///C:/Users/cui/Documents/www/dexinlabs/server/utils/db.ts) Nitro auto-import `useDb()` |
| 五层调用链：Page → Composable → API → Service → Repository → Drizzle → Neon | ✅ | 严格分层，每一层仅依赖下一层 |
| Repository 层（纯 CRUD，TS 化 + $infer 类型） | ✅ | [repositories/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/repositories) 5 Repository TS 化，`_getDb()` 方法懒加载防 Rollup 内联，Drizzle query builder 变量用 `any` 绕泛型严格校验；提供 list/getBySlug/getById/count/create/updateBySlug/upsert/deleteBySlug + 集合查询 |
| Service 层（业务聚合，TS 化） | ✅ | [services/](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/services) 4 Service TS 化；Service→Repo 单向，禁止 Service 间调用 |
| 5 条 server/api/* 改造为仅调用 Service + 严格参数校验 | ✅ | 5 路由均使用 `@modules` 别名导入 Service，禁止相对路径计算错误；400 缺参 / 404 未找到显式抛错 |
| Loader 层同步对接 Service（TS 化 + @deprecated） | ✅ | loader/course.ts / loader/chapter.ts / loader/lesson.ts 调用对应 Service；对外签名 100% 兼容；按 ADR0709 未来下沉 `data/_internal/loaders/` 冷宫 |
| DatabaseSource 真实现（Drizzle 版） | ✅ | [source/database/DatabaseSource.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/source/database/DatabaseSource.js) findOne/findAll/count Drizzle 原生落地；五表映射；SourceContract 完全实现 |
| 数据源清理：仅保留 Database 一种来源 | ✅ | 删除 `source/cms/`、`source/content-v3/` 整目录；`createSource()` 仅保留 database/neon/neon-drizzle/markdown/filesystem 全部指向 DatabaseSource；删除对应 SOURCE_TYPES |
| 组件目录按 Nuxt 约定释放到 app/ | ✅ | `app/modules/practice/components` → `app/components/exercise/`；`app/modules/course/components` → `app/components/course/`；`app/shared/components` 合并到 `app/components/app/` 等；nuxt.config.components.dirs 去除 practice/course 配置 |
| plugins/ 移入 app/（符合 Nuxt srcDir 约定） | ✅ | `plugins/content-engine.client.js` / `.server.js` → `app/plugins/`；按 ADR0709 v2 后续改名去 Content 前缀 |

### P2 · Content Engine & 渲染系统（阶段 3→4 推进）

| 项 | 状态 | 关键交付 |
|---|---|---|
| Contracts + Core + Registry + Pipeline（TS 化 + 拆分 Registry/DataRegistry/RenderRegistry） | ✅ | contracts/ 全部 TS 化（Source/Loader/Query/Parser/Transformer/Renderer），`export type XxxContract = XxxContractMethods` 解决 TS2749 值/类型命名冲突；Registry 拆分为 dataRegistry + renderRegistry，registry.ts 作为薄壳 re-export 层 |
| Transformer 7 个独立模块（heading/toc/links/excerpt/readingTime/reference + math 预留） | ✅ | Transformer order 号段预留；bootstraps 独立扁平化文件结构（parser/transformer/renderer/database） |
| Core Pipeline 拆分 DataPipeline / RenderPipeline | ✅ | pipeline.ts 拆为 dataPipeline.ts + renderPipeline.ts；pipeline.ts 作为协调器导入两者（按 ADR0709 v2 后续 DataPipeline → `data/pipeline.ts`、RenderPipeline → `render/pipeline.ts`） |
| Boot 层拆为 bootstraps/ 子目录，boot.ts 纯编排 | ✅ | boot.ts 74 行精简版纯 orchestration；bootstraps/{parser,renderer,transformers,database,queries} 各自独立实现；queries/lazyQuery.ts 独立（未来 Data 域的 data/queries/ 位置） |
| 领域共享类型抽离 contracts/types.ts | ✅ | Course/Chapter/Lesson/Exercise/Asset 五实体 + TocEntry/HeadingInfo/元信息接口抽出 contracts/types.ts；data.ts/render.ts 双向引用 |
| Nuxt ContentRenderer 依赖移除 | ✅ | [MarkdownRenderer.vue](file:///C:/Users/cui/Documents/www/dexinlabs/app/modules/content/renderer/theme/MarkdownRenderer.vue) 去掉 `<ContentRenderer>`；引入 `marked` MD→HTML + `v-html`；GFM + breaks + headerIds |
| `@nuxt/content` 模块彻底卸载 | ✅ | package.json 移除 modules；卸载 better-sqlite3/rehype-katex/remark-math；删除 content.config.js、server/utils/contentAdapter.js、旧 source/content-v3/*、CMSSource、4 collection 函数文件 |

### P3 · 内容源模式 & 架构演进（核心架构升级）

| 项 | 状态 | 关键交付 |
|---|---|---|
| Markdown/YML Source of Truth 确立 | ✅ | `content/` 目录保留且仅保留：不做任何运行时读、不被 Nuxt build 期索引、不参与 SSR；唯一角色=编辑+Git+AI+多人协作真源；Runtime 严禁读 content/，DB 副作用不得覆盖 Markdown 字段 |
| Neon 确立为"运行时数据库"角色 | ✅ | 高效索引、关联查询（课→章→节→练习）、未来用户/进度/提交体系存储；换库只需重跑 `npm run sync` |
| 幂等同步脚本 `npm run sync`（js-yaml 5.x 命名导出修复） | ✅ | [content/sync.js](file:///C:/Users/cui/Documents/www/dexinlabs/content/sync.js)：auto-load `.env` → fast-glob 扫 3 类文件 → js-yaml `import * as yaml` 命名导出修复（5.x 弃默认导出）→ slug upsert 幂等 → closeDb 关池 → 四计数汇总+明细；path.resolve+反斜杠替换兼容 Windows fast-glob |
| 表推到 Neon：`drizzle-kit push` 建五张表 | ✅ | schema 路径从绝对路径改相对路径解决 Windows drizzle-kit "No schema files found" 报错；成功 push 创建 courses/chapters/lessons/exercises/assets 五表 |
| 内容同步 ≥8 文件到 Neon 成功 | ✅ | `npm run sync` 本地执行成功；8 文件 scanned → 8 upserted → 0 error；Neon 控制台可见数据 |
| 本地 6 页面 smoke 全过（Markdown 渲染正常） | ✅ | home / course / chapter / lesson / exercise / about 无白屏无 500；标题+正文+TOC 渲染内容与 SoT 一致 |
| ADR0708 目录快照文档 | ✅ | [docs/ADR/adr0708.md](file:///C:/Users/cui/Documents/www/dexinlabs/docs/ADR/adr0708.md) 9 章节目录+调用链+硬约束 onboarding 地图（实施 ADR0709 后 DEPRECATED） |
| ADR0709 v2 架构重构方案（100% 采纳第二轮 8 条评审） | ✅ → 📐待实施 | [docs/ADR/adr0709.md](file:///C:/Users/cui/Documents/www/dexinlabs/docs/ADR/adr0709.md) v2；去 modules、Core 收敛三域（Contracts/Registry/Engine）、Boot 独立顶层、Pipeline 归各自领域、新增 Shared 地基、Utils 统一 shared/utils、Query 回归 Nuxt composables/、Loader 冷宫、彻底移除架构级 Content 命名、最终 10+1 顶层目录树 + 59 文件精确映射表 + 4 Phase 迁移计划 + 9 风险矩阵 + 最坏 30s 回滚 |

---

## 三、进行中

| 项 | 进度 | 阻塞点 |
|---|---|---|
| **ADR0709 v2 架构重构方案评审定稿** | ✅ v2 已输出，100% 采纳 8 条评审意见，待终审 APPROVED 后择机实施 | 无（文档侧已定稿）；等待选定实施方案 A（一次性全量 6~8h）/ B（三域分 Batch）/ C（零代码文档先行） |
| **自研 Markdown 真解析**（micromark/mdast AST + Prose 组件族） | 0%（仍停留在 marked passthrough HTML 阶段） | 优先级待定（基础 MD 能跑即可，后续可平滑替换）；ADR0709 实施前不建议动 Renderer 代码（避免移动+修改双重冲突） |
| **Exercise/Asset 的 Markdown SoT 同步逻辑补全** | 0% | 本轮只做了 Course/Chapter/Lesson 三类同步，Exercise 只能 DB 编辑，Asset 完全未处理 |

---

## 四、下一目标（按优先级）

### 立即（本轮交付落地后的第一件事）

1. **选定 ADR0709 实施方案并执行迁移**：优先方案 A（一次性迁移，趁仅 8 个同步内容+少量页面，一次清完总成本最低）：
   - Phase 1：40 文件移动 → Phase 2：~120 import 替换（全局正则+别名化） → Phase 3：5 新别名 + 去 Content 命名兼容期 → Phase 4：8 Success Criteria 全勾
   - 最坏回滚 30s：`git revert adr0709-migration-commit`
2. **验证迁移后生产部署**：`npm run build` + `npx vercel deploy --prebuilt`，SSR 首页/课程/章节/课时/练习均 HTTP 200 且 HTML 含课程标题
3. **ADR0709 状态：PROPOSED → IMPLEMENTED**；1~2 周兼容期结束后 cleanup commit 删除 barrel + 旧 provide + 旧别名

### 中期（ADR0709 实施完毕后再动）

4. **Exercise 的 Source of Truth 方案确认**：继续走 DB 编辑 → 保持现状即可；改走 Markdown/YAML → 写 `content/exercise/**/*.md` + sync.js 加 exercise 扫描分支
5. **Asset 方案确认**：content/assets/yml + sync.js 上传到 CDN（R2/OSS）写回 url；或完全 DB 记录
6. **真正 AST Parser + 递归 Prose 组件替换 marked + v-html**：落在 `app/render/parsers/`（ADR0709 后的新位置）；新增 Prose 组件族放 `app/render/components/`；为 inline math/callout/mermaid 准备

### 长期（工程化收尾）

7. CI：`.github/workflows`（或 Vercel Pipeline）build 前 `drizzle:migrate` 自动迁移 + `sync --check` 校验 content/ 语法
8. 课程/章节/课时增删改后台：可选（坚持 SoT=代码仓 Markdown 则增删改走 MR 流程，不需要后台）
9. 若 LOC 突破 10k 或团队 ≥ 5 人：按 packages/ 升级 monorepo（ADR0709 目录已完全对齐 package 边界，仅需 package.json + pnpm-workspace.yaml）

---

## 五、里程碑

| 里程碑 | 目标 | 预计交付 |
|---|---|---|
| M1（已到） | Content Engine 8 层骨架 + Database/CMS 接口预留 + Nitro 构建 0 错误 | ✅ 2026-07-07 早 |
| M2（已到） | Prisma → Drizzle + 五层严格分层 + 卸载 @nuxt/content + 运行时只走 Neon | ✅ 2026-07-07 晚 |
| M3（已到） | Markdown/YML Source of Truth 确立 + `npm run sync` 幂等同步 | ✅ 2026-07-07 晚 |
| M3.5（已到，今日） | Vercel 500 根治（db Proxy 懒加载）+ JS→TS 二轮全量回迁（typecheck 0）+ 数据源清理（仅 Database）+ ADR0708 目录快照 + ADR0709 v2 架构重构方案（100% 采纳 8 评审意见） | ✅ 2026-07-08 |
| M4 | ADR0709 一次性迁移实施完毕（方案 A）；Success Criteria 8 条全勾；Vercel 生产部署 SSR 正常；兼容期 barrel 清理 | 下一次动手（6~8h 平静窗口） |
| M5 | 自研 AST Parser + 递归 Prose 组件族，移除 marked + v-html | 待定 |
| M6 | Exercise/Asset SoT 补齐 + CI 自动迁移 + 构建校验 | 待定 |

Current Sprint（ADR0709 迁移窗口）

**三件事（按顺序）**：

1. **启动 ADR0709 迁移**：开独立分支 `adr0709-migration`，git status clean，前置 checklist（typecheck 0 + build 绿 + 6 页面 smoke）通过后开始 Phase 1~4
2. **Phase 2 import 替换 & Phase 3 命名兼容**：全局正则 + 5 新别名；`@modules/content/` → `@core/@boot/@data/@render/@shared`；ContentEngine → Engine；兼容期 barrel+双注入
3. **8 Success Criteria 全勾 + 生产部署**：`npx nuxi typecheck` 0 + `npm run build` 绿 + 6 页面 smoke + `npm run sync` ok + 跨域红线检查（无 @data/@render 互引）+ `vercel deploy --prebuilt` 200 + ADR 状态变 IMPLEMENTED

完成标准：

✓ `app/modules/` 目录删除，`app/` 顶层只剩 10+1 目录（5 能力域 + 5 Nuxt 官方 + assets）

✓ `grep -R "ContentEngine\|contentEngine\|contentQuery" | grep -v "_legacyModulesContent\|node_modules"` → 仅剩兼容期 barrel 内的旧名 re-export

✓ Neon 控制台五表数据不变、同步幂等不变（`npm run sync` 第二次 scanned=8 upserted=0 skipped=8 errors=0）

✓ `npx nuxi typecheck`：0 errors

✓ Vercel SSR 首页 HTML 含课程标题（水合正常）

本阶段禁止：

× 在 ADR0709 迁移 commit 内混入任何业务逻辑改动（只允许 rename + import 字符串改 + config 别名加）

× 写新功能前先不迁架构（必须先架构干净再动新业务，否则移动+修改双冲突回滚难）

× Render/Data 互相直接 import（必须通过 Core.Engine 或 Shared）
