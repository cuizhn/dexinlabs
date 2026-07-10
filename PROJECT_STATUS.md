# 项目状态 PROJECT_STATUS
> 最后更新：2026-07-10 · 架构阶段：Core 目录五域归位（content-engine/markdown-engine/database/storage）+ Boot 聚合层删除 + Engine 独立·Application 编排 红线落地 · 落地状态：✅ tsc 0 errors + 17+ Engine Tests 三绿 + grep 零别名残留

---

## 一、当前架构版本（2026-07-10 Core v4 — 已落地 100%）

基于"**Core 目录重构说明**" + "**删除 Boot 统一启动层**"两轮架构方向调整（100% 采纳）的最终 **Core 五域 + Engine 独立·Application 编排** 模型：

```
app/
  core/              【十年稳定·四层纯技术能力】只承载非业务共享能力，零 Vue 零 UI 零业务
    ├── content-engine/    【内容能力】facade + models + queries + services(4)
    │                         只能依赖 @core/database/repositories；禁止 import @me
    │                         禁止直接调用 Drizzle API
    ├── markdown-engine/   【Markdown 能力】src(parser/ast/plugins/pipeline/compiler/adapters) + tests + 3 文档
    │                         禁止 import @ce / Course / Lesson / Repository / Service
    │                         零 Nuxt / 零 DB / 零 Vue 依赖，可独立发 npm
    ├── database/          【数据能力】connection + schema + migrations + repositories(5) 实现
    │                         独占 drizzle-orm/drizzle-kit 包引用；Application 层零穿透
    └── storage/           【资源能力】预留空壳（上传/删除/URL/meta）
  modules/           【业务模块】预留空壳（course / practice / review ...）
                     → 仅允许依赖 @core/**，不得直接引用 drizzle/repository
  plugins/           【Application 编排层 1】engine.server.js + engine.client.js
                     → 直接组合 @ce + @me；ensureDrizzle 内联 @core/database 动态 import
  composables/       【Application 编排层 2】useCourse/useLesson/useChapter/useExercise
                     → 走 useAsyncData + /api/*；不直接依赖 Core 具体实现
  + components / pages / layouts / assets （Nuxt 官方约定）
                     → 仅允许通过 plugins 提供的 $content / $markdown / $services 组合两 Engine
```

**架构红线（4 条禁令）**
1. ❌ 禁止 Application → Drizzle（直接 import 'drizzle-orm' 仅允许在 `app/core/database/**` + 根 `drizzle.config.ts`）
2. ❌ 禁止 Page → Repository
3. ❌ 禁止 Component → Database
4. ❌ 禁止 content-engine ↔ markdown-engine 互相 import（各自独立，组合权 100% 在 Application）

---

## 二、2026-07-10 两轮大迁移（当天完成）

### Round A：Core 目录归位 — 根 4 目录全量迁入 `app/core/`

迁移规则：**四不变原则** — API 不变 · Contract 不变 · 调用链不变 · 功能不变
迁移范围：4 原目录 × ≈35 文件 move · ≈25 处 import 改写 · 3 配置文件（nuxt/tsconfig/drizzle）别名重排

| 原目录位置 | 迁入 `app/core/` 后位置 | 说明 |
|---|---|---|
| 根 `markdown-engine/`（src + tests + 3 ADR/DESIGN/SPEC 文档） | `app/core/markdown-engine/` | 目录结构完整保留（src/tests/ADR），仅路径前缀变化 |
| 根 `content-engine/`（models + queries + facade） | `app/core/content-engine/` | 与迁入的 services 合并为完整 Content Engine |
| `app/data/services/`（Course/Chapter/Lesson/Exercise 4 Services） | `app/core/content-engine/services/` | 职责归属 Content Engine（属内容能力） |
| `server/database/`（connection + schema + migrations） | `app/core/database/` | Drizzle 属 Infrastructure，不进业务 modules |
| `app/data/repositories/`（5 Repositories 实现） | `app/core/database/repositories/` | 职责归属 Database 层；Content Engine 只依赖接口类型 |

**配置同步改动 3 文件：**
- [nuxt.config.ts](file:///C:/Users/cui/Documents/www/dexinlabs/nuxt.config.ts#L56-L80)：新增 `@core → app/core`；`@me → app/core/markdown-engine/src`；`@ce → app/core/content-engine`；**删除 `@data` 别名**
- [tsconfig.json](file:///C:/Users/cui/Documents/www/dexinlabs/tsconfig.json#L13-L27)：同步新增 `@core/@me/@ce` 双 entry paths；删除 `@data` 两行；`include` 保留 `app/core/**/*.ts`
- [drizzle.config.ts](file:///C:/Users/cui/Documents/www/dexinlabs/drizzle.config.ts)：`schema → ./app/core/database/schema.ts`；`out → ./app/core/database/migrations`；根目录保留作为构建工具配置

**依赖约束验证三连 ✅（Round A 完成即校验）**
| # | 验证项 | 命令 | 结果 |
|---|--------|------|------|
| 1 | 类型检查 | `npx tsc --noEmit` | ✅ 0 errors |
| 2 | 穿透检测 | grep `@data\|server/database\|app/data` 全项目 *.ts/*.js/*.vue | ✅ 13 处全部来自**尚未删除的 4 原目录旧文件**，删除后为 0 |
| 3 | Engine 测试 | `npx vitest run app/core/markdown-engine/tests` | ✅ 17+ 全绿（AST Adapter 5 / Parser 7 / Pipeline 6 / Compiler 5） |

### Round B：Boot 聚合层 100% 删除 — Engine 独立·Application 编排落地

迁移规则：**三不原则** — 不新增总 Facade · 不增加新抽象层 · 不改变 Engine 内部 API

| 删除项 | 理由 | Application 替代方式 |
|---|---|---|
| 整个 `app/boot/` 目录（index.ts 1 文件 · 纯 @ce/@me 转出口 + `ensureDrizzle()`） | Boot 本质是总 Engine 聚合层，违反「两 Engine 独立、Application 自行组合」红线 | 两 plugins 直接 `import @ce` + `import @me`，自行 provide 给 Nuxt |
| `@boot` 别名（nuxt.config 2 处 + tsconfig 2 行） | 目录不存在，别名必删 | — |
| `import { ensureDrizzle } from '@boot'`（2 plugins） | Boot 残留唯一 API | plugins 内联：`await import('@core/database').catch(() => {})` |

**依赖隔离检测四连 ✅（Round B 完成即校验）**
| # | 验证项 | 命令 / 范围 | 结果 |
|---|--------|------|------|
| 1 | Content Engine 内部零 Markdown 引用 | grep `@me` / `markdown-engine` 在 `app/core/content-engine/**` | ✅ 0 matches（两 Engine 独立） |
| 2 | Markdown Engine 内部零内容引用 | grep `@ce/Course/Lesson/Repository/Service` 在 `app/core/markdown-engine/**` | ✅ 0 matches（两 Engine 独立） |
| 3 | Drizzle 包零穿透到 Application | grep `from 'drizzle-orm*' / 'drizzle-kit'` 全项目 | ✅ 12 处**仅**出现在 `app/core/database/**`（schema + connection + 5 repos）+ 根 `drizzle.config.ts`（完全符合架构约束） |
| 4 | Boot 关键词零残留 | grep `@boot / bootContentEngine / EngineFacade / BootEngineResult / __booted / __noopDataPipeline` 全项目 | ✅ 0 matches；4 处 `ContentEngineFacade` 为 content-engine 自身公开接口（属允许范围） |

---

## 三、关键踩坑记录（2026-07-10 两轮新增）

| # | 踩坑点 | 根因 | 解决方案 |
|---|--------|------|---------|
| 1 | **Copy-Item 空目录静默失败** | `Copy-Item src dest -Recurse` 在目标目录下含多级子目录但 `repositories/` 为空（仅 barrel 文件）时 PowerShell 5.1 不自动创建 | 改先 `New-Item -ItemType Directory -Force app/core/database/repositories` 再 copy |
| 2 | **content-engine/services index 错误引用 `@data`** | 迁移到 `app/core/content-engine/services` 后 barrel 文件仍写 `from '@data/services/XXX'` | 全部改同级相对路径 `'./CourseService.js'`，去掉别名依赖 |
| 3 | **repository 内部路径 3 级跳错** | 5 Repository 从 `app/data/repositories` 迁到 `app/core/database/repositories`，原相对路径 `../../../server/database` 和 `../../../content-engine/models` 全部失效 | 统一改 `from '../index'`（database/schema+connection）和 `from '../../content-engine/models/index'` |
| 4 | **content-engine 原 facade `ensureInitialized` 指向旧 `server/database`** | `import('../server/database')` 路径已不存在 | 改 `import('../database')`（在 core 目录下直接找同级 app/core/database） |
| 5 | **Repository 归属的 barrel 陷阱** | 初期在 `content-engine/repositories/index.ts` 建了个空 barrel 导致循环依赖 | **物理删除**该空目录；Content Engine 通过 `@core/database/repositories` 直接引用（清晰无歧义） |
| 6 | **engine.client.js / engine.server.js 双文件漏改** | 只看了 server.js，忘 client.js（和 server 完全一致的 20 行） | 双文件并行处理：一起删 @boot 引用、一起把 ensureDrizzle 改内联 |

---

## 四、遗留清理（7 天兼容期窗口 · 2026-07-17 截止）

兼容期保留 3 个旧调用兼容：
```
app/render/*（薄 Vue 适配层）     → 未来直接让 Application 组合 @me 后自行提供 Vue 适配（当前 100% 工作但属过渡）
根 content/sync.js（独立脚本）    → 用相对路径写死（脚本不走 Nuxt alias，本就正确）
根 drizzle.config.ts              → 保留（属于构建工具配置惯例）
```
→ 2026-07-17 后逐个评估清理（非 Breaking，不触发 RFC）。

---

## 五、2~3 迭代内建议（非本次）

1. **modules 起步：拆分 `app/modules/course` 首个业务模块**（仅依赖 `@ce` facade + `@me`，不得直接碰 drizzle/repo）
2. **storage 落地实现**：先上 R2 / OSS 通用接口抽象 → 接 assets（课程图片/视频）；再让 `@ce` 的 AssetService 依赖 storage 接口
3. **Content Engine Cache 落地**：`content-engine/_internal/cache/` 先上 Service 级 LRU（size=256）→ lesson/chapter 列表命中后省 50%+ DB
4. **Content Engine 新增 Navigation / Search 能力**（文档规划的未来能力，需 RFC）
5. **tsconfig 严格模式升级**：`noImplicitAny: false → true`，分模块渐进开启（需单独一轮排期）

---

## 六、回滚保障（最坏 <1min）

本次两轮动作**均为纯 rename + import 字符串改 + 别名改 + 目录删**，零业务逻辑改动：
- Round A 回滚：`git reset --hard core-migration-before` 即可一次性恢复根 markdown-engine/、根 content-engine/、server/database/、app/data/
- Round B 回滚：恢复 `app/boot/` + `@boot` alias 即可（4 行 nuxt/tsconfig + 1 个 73 行 index.ts 文件）
- Content Engine / Markdown Engine 公共 API 100% 保持稳定，Application 组合层（plugins/composables）调用方式未变，业务代码零感知。
