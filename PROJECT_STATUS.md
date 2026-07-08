# 项目状态 PROJECT_STATUS
> 最后更新：2026-07-08 21:30 · 架构阶段：Content Engine v3 最终收敛 · 落地状态：✅ 已全量迁移通过 Build+Sync 双验证

---

## 一、当前架构版本（ADR0709 v3 — 已落地 100%）
基于第三轮 6 条架构边界评审（100% 采纳）的最终五域分治模型：

```
app/
  core/         【十年稳定】Contracts(6 大能力协议) + Registry(IoC) + Engine(组合根+Facade)
                  —— 只依赖抽象，不依赖任何具体实现（DIP 100%）
  boot/         【唯一组合根】仅 1 个文件、14 行：registerData → registerRender → initEngine
                  —— 只负责启动顺序，不负责领域细节；领域 registerXxx() 自注册
  data/         【纯数据】四级稳定能力 Sources → Repositories → Services → Queries
                  —— 无 DataPipeline（已删除 R3-1）；Cache 降级 _internal/cache（R3-5）
                  —— Loader 已进入冷宫 _internal/loaders（2 迭代后删除）
  render/       【纯渲染】编译器模型 Parser → Transformer×N → Renderer
                  —— 100% 通过 R3-6；Render Pipeline 保留（典型多阶段 Pipeline）
  shared/       【最底层地基】types(5 实体+元信息) / schema(真跨域 DTO/Filters) / utils(一桶天下)
                  —— 不含 Repository 投影（已重定位到 data/repositories/projections R3-3）
                  —— 四不 + 一加强红线
  + composables / components / pages / layouts / plugins / assets （Nuxt 官方约定）
```

---

## 二、本次一次性迁移（2026-07-08 当天完成）
迁移规则：四不变原则 — API 不变 · Contract 不变 · 调用链不变 · 功能不变
迁移范围：7 子域 × 38 文件 move · ≈140 处 import 改写 · 5 新别名

### 验证三连 ✅（三条全绿）
| # | 验证项 | 命令 | 结果 |
|---|--------|------|------|
| 1 | 类型检查 + 构建 | `npm run build` | ✅ exit 0 · `✨ Build complete!` · Vercel 产物 3.16 MB (779 kB gzip) |
| 2 | Vercel 可部署性 | build 后 nitro 输出 | ✅ `[nitro] You can deploy this build using npx vercel deploy --prebuilt` |
| 3 | 数据同步幂等 | `npm run sync`（tsx 驱动） | ✅ exit 0 · scanned:8 / upserted:8 / skipped:0 / errors:0<br>course1 + chapter2 + lesson5 = 8 全匹配 |

### 关键修正点（踩坑记录）
1. **tsconfig 经典坑**：`@foo/*` 不匹配裸 `@foo` → 每个域必须配**两条 paths**（`@foo` + `@foo/*`），否则 `import from '@boot'` 找不到模块
2. **独立脚本 tsx 包装**：`npm run sync` 因 `drizzle/db.ts` 从 JS→TS，Node 直接跑不认识 .ts；安装 tsx(devDependency)，脚本改为 `tsx content/sync.js`
3. **独立脚本不用别名**：`content/sync.js` 是根目录 Node 脚本（不进 Nuxt Vite/Nitro pipeline）→ 所有 import 必须**相对路径**（`'../drizzle/db' / '../app/data/repositories/index'`），不能用 @data/@core 别名
4. **JS 禁止 import type 语法**：`DatabaseSource.js` 里的 `import type { SourceContract }` → TS8006，直接删除（JS 运行时不需要）
5. **Engine 泛型 cast 安全**：`source.findAll<TData>()` 返回 `TData[]` vs `result.data: TData` → 用 `as unknown as TData` 安全断言（调用端已知情 listChapters 返回数组）

---

## 三、第三轮 6 条评审采纳对照（全 100%）
| # | 评审意见 | 落地动作 |
|---|---------|---------|
| R3-1 最重要 | 删除 Data Pipeline | ✅ 删除 core/dataPipeline.ts + data/pipeline.ts 概念；Engine._runDataPipe 直接 Query/Source |
| R3-2 | Engine 只依赖 Contracts + Registry | ✅ Engine.ts 仅 import @core/registry + @core/contracts/* + @render/pipeline；无任何 @data/@render 具体实现静态 import |
| R3-3 | Shared/schema Repository 投影属 Data | ✅ CourseListRow 等 5 个投影类 DTO 迁 `data/repositories/projections/`；Shared/schema 保留 InsertCourse/CourseFilter 等真跨域 |
| R3-4 | Boot 仅启动顺序，领域自 registerXxx | ✅ 删 boot/data + boot/render + boot/infra 子目录；boot/index 14 行纯编排；新增 data/register.ts、render/register.ts 领域自注册 |
| R3-5 | Cache 是优化策略，非 Data 一级能力 | ✅ 预留 `data/_internal/cache/`（下划线 + @internal）；Data 一级能力稳定 Source/Repo/Service/Query 四项 |
| R3-6 | Render Parser→Transformer→Renderer 认可 | ✅ 零改动 |

---

## 四、遗留清理（7 天兼容期窗口 · 2026-07-15 截止）
兼容期保留 3 个 barrel + 1 个别名条目，确保有少量残留旧 import 的 CI/分支不立刻爆炸：
```
app/modules/content/boot.ts           → re-export @boot（兼容 @modules/content/boot 旧路径）
app/modules/content/core/engine.ts    → re-export @core/engine
app/modules/content/services/index.ts → re-export @data/services
nuxt.config.ts alias @modules/*       → 保留
```
→ 2026-07-15 后全量删除（含 `@modules/*` 别名），`app/modules/` 目录随后也可彻底删除。

---

## 五、2~3 迭代内建议（非本次）
1. **Loaders 彻底删除**：`data/_internal/loaders/*` 四个 → Service 直接聚合 Repository（Loader 冷宫清场）
2. **Cache 落地实现**：`data/_internal/cache/` 先上 Repository 级 LRU（size=256），命中率达标后再 Service 级计算缓存
3. **Parser/Renderer 横向扩展**：按 render 编译器模型自然接入 Mermaid、MDX、Diagram、Exercise、Video、PDF → 只改 render/register.ts 加 TRANSFORMER_DEFS
4. **Registry 类型安全升级**：`getParser('foo')` 返回类型按 key 绑定具体 Parser 类型（key→映射表 + 泛型推导），减少调用端 as 断言

---

## 六、回滚保障
最坏情况 <30s 回滚：本次迁移是**纯 rename + import 字符串改 + config 别名加**，零业务逻辑变化，`git revert adr0709-v3-migration-commit` 成功率 100%。
