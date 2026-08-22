# Taxonomy Migration — Post-flight Validation Report (V1)

> 状态：Phase 3 Post-flight Dry-run 完成报告
> 日期：2026-08-22
> 分支：`dexinlabs-content/taxonomy-migration-20260822`（commit `5afa589`）；主仓 `taxonomy-migration-20260822`（干净基准）
> 性质：**验证报告，非执行报告**。本阶段未做 git mv / DB 写 / manifest 改写 / lesson 改写 / prerequisite 落库 / 正式 publish。

---

## 1. Scope

验证已设计的迁移方案在 **Source → Compiler → Package → DB → Runtime** 链路上的成立性。

覆盖：
- Source Directory（content repo `lessons/`）
- Manifest V2（`content-manifest.json`）
- Compiled Content Package（`output/content-package.json`）
- Database（Neon，已 Phase 2 单事务迁移）
- Runtime 路由 / API / 活跃 UI（主仓 `app/` `server/` `shared/`）
- Prerequisite Graph（设计文档 dry-run，无 DB 表）

不覆盖（本阶段未做）：正式 publish、生产部署、DB 回滚、git merge/push。

---

## 2. Environment / Branch

| 仓库 | 分支 | HEAD | 状态 |
|---|---|---|---|
| dexinlabs-content | `taxonomy-migration-20260822` | `5afa589` | 已提交（66 files） |
| dexinlabs（主仓） | `taxonomy-migration-20260822` | `41e48d2` | 干净基准，无代码改动 |
| DB（Neon） | — | — | Phase 2 已迁移，备有 `backup-pre-phase2-*.json` |

Node: 22.22.2（managed）；pg driver 可用。

---

## 3. Source Status

- `lessons/` 目录结构：6 topic / 12 chapter（含 lesson）/ 15 空章（`.gitkeep`）/ 41 lesson `.md`
- 旧目录名残留：**无**（`number-and-algebra` / `statistics-and-probability` / `rational-numbers` / `algebraic-expressions` / `linear-equations` / `geometry-basics` / `coordinate-system` / `triangles` / `congruent-triangles` / `pythagorean-theorem` / `functions` / `linear-functions` / `comprehensive-practice` 均不存在）
- `comprehensive-practice` 整章已按确认移除（7 文件删除）

---

## 4. Manifest Status

- `content-manifest.json`：`schemaVersion=2`，6 topics，27 chapters（全带 `topic_slug`），lessons 不进 manifest
- 旧 slug 残留：**无**
- V2 契约校验（编译器 `check-contract.ts`）：**PASS**

---

## 5. Compiler Result

- `tsx compiler/index.ts`：41/41 lesson 编译 **0 FAIL**
- 关键证据：`geometry/triangle/` 正确聚合 9 lesson（含合并后的 `right-triangle-secret` / `congruent-triangles` / `pythagorean-theorem`），证明 triangle 合并在编译层正确
- `manifest.topics=6` / `manifest.chapters=27` 生效

---

## 6. Content Package Contract Result

- `output/content-package.json`：protocol_version=1, ast_version=1, schemaVersion=2
- Package Contract 校验（`check-contract.ts`）：**PASS**
- lessons=41，无重复 identity，无多余字段

> 注：compiler 的 V2 契约对齐修复（`index.ts` 提升 `schemaVersion` 到顶层、`check-contract.ts` 放宽字段）已完成；`compiler/` 被 `.gitignore` 忽略，未入库（本地一致性修正）。

---

## 7. DB Consistency Result

Phase 2 迁移事务已提交，post-flight 校验：

| 维度 | 计数 |
|---|---|
| Topics | 6 |
| Chapters | 27 |
| Lessons | 41 |
| 重复 chapter identity (topic_id,slug) | 0 |
| 重复 lesson identity (topic_id,slug) | 0 |
| lesson 的 chapter_id 为 NULL | 0（全部 41 绑定） |
| 孤儿 chapter（topic 无效） | 0 |
| 孤儿 lesson（topic 无效） | 0 |
| 孤儿 lesson（chapter 无效） | 0 |
| 旧 topic slug 残留 | 0 |
| 旧 chapter slug 残留 | 0（`sets` 是当前有效章，非残留） |

DB 终态与 Manifest/Source/Package 完全一致。

---

## 8. Prerequisite Validation

- Prerequisite DB 表：**不存在**（符合调整 2：prerequisite 不落库，保持独立 Learning Graph 设计）
- 设计文档：`ARCH-PREREQUISITE-GRAPH-V1.md`（在 v5-wip 分支，已导出审计副本）
- Dry-run 校验：将文档中 29 条硬边（OLD chapter slug）按 A.3 映射表转译为当前 slug 后：
  - dangling source：0
  - dangling target：0
  - self-loop：0
  - cycle：无（DAG）
  - **PASS**
- 特别验证：
  - function 独立：`functions`→`function-concept`、`linear-functions`→`linear-function`，跨 Topic 边 `cartesian-coordinate-system → linear-function-graph`（geometry→function）正确解析
  - triangle 合并：3 旧章 lesson 统一解析到 `geometry/triangle/`，无断裂
  - equation 拆分（linear-equation → system-of-equations / quadratic-equation）：当前为 Candidate 预留边，无硬边跨章错误
- 结论：prerequisite 设计在迁移后 taxonomy 下成立，待 AST v2 `priorKnowledge` 落地后可自动提取候选。

---

## 9. URL Redirect Validation

**结论：301 redirect 未实现 — `Deferred — pre-launch project`。**

> 项目尚未上线，无历史 URL、SEO 索引或外部链接。经确认：301 **不作为当前 P1 修复项**，不要求现在实现 runtime redirect。旧→新 URL 映射保留于下方表格备查，但 runtime redirect 标记为 Deferred，在正式上线前再次确认是否需要实现。详细设计见 `ARCH-TAXONOMY-MIGRATION-PHASE4-PLAN-V1.md` §5。

逐项映射记录（旧 → 新，仅记录，不实现 redirect）：

| old URL | new URL | status | implementation location | PASS/FAIL |
|---|---|---|---|---|
| `/courses/number-and-algebra/rational-numbers/*` | `/courses/number/number-system/*` | 无 redirect（Deferred） | 无 middleware / 无 route / 无 nuxt.config router 规则 | N/A（Deferred） |
| `/courses/number-and-algebra/functions/*` | `/courses/function/function-concept/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/number-and-algebra/linear-functions/*` | `/courses/function/linear-function/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/algebra/algebraic-expressions/*` | `/courses/algebra/algebraic-expression/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/algebra/linear-equations/*` | `/courses/algebra/linear-equation/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/geometry/geometry-basics/*` | `/courses/geometry/geometric-foundation/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/geometry/coordinate-system/*` | `/courses/geometry/coordinate-geometry/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/geometry/triangles/*` | `/courses/geometry/triangle/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/geometry/congruent-triangles/*` | `/courses/geometry/triangle/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/geometry/pythagorean-theorem/*` | `/courses/geometry/triangle/*` | 无 redirect（Deferred） | 同上 | N/A |
| `/courses/statistics-and-probability/probability/*` | `/courses/probability/random-event-and-probability/*` | 无 redirect（Deferred） | 同上 | N/A |

**实施位置现状（仅说明，不修改）**：
- `app/pages/courses/[topicSlug]/[lessonSlug].vue` — 仍是**两层**路由（`/courses/{topic}/{lesson}`），非 ADR-0018 规定的三层 `/courses/{topic}/{chapter}/{lesson}`
- `server/api/lessons/[slug].get.ts` — 仅 `(topic, lesson)` 解析，无 chapterSlug、无 redirect
- `nuxt.config.ts` — 无 `router` redirect 规则
- 全仓无 `middleware` / `createError(301)` / `redirect` 逻辑

**影响评估**：旧 URL 不会 301 到新 URL —— 但项目未上线，无历史流量，此影响可忽略。真正需要修复的是**两层路由与三层 Manifest/DB 结构不匹配**（见 K1 重分类）。301 本身从 P1 降级为 Deferred，不阻塞 Phase 3 / Phase 4。

---

## 10. Old Identity Residue Scan

区分 ACTIVE CODE / TEST / DOCUMENTATION / MIGRATION RECORD。

### ACTIVE CODE（runtime / source / manifest / compiler / publish）

| 文件 | 旧 identity | 类型 | 严重度 |
|---|---|---|---|
| `app/components/home/homeData.ts:97,107,112` | `number-and-algebra` / `statistics-and-probability` / `comprehensive-practice`（topic slug）且缺失 `algebra` / `function` topic | 活跃 UI（首页知识地图） | **P1** |
| `app/database/seeds/seed-v4.ts` | 整段旧 taxonomy（number-and-algebra / rational-numbers / algebraic-expressions / linear-equations / geometry-basics / congruent-triangles / coordinate-system / pythagorean-theorem / statistics-and-probability / comprehensive-practice） | seed fixture（非实时运行） | **P2** |

- `lessons/` 目录：**无**旧 slug 残留
- `content-manifest.json`：**无**旧 slug 残留
- `compiler/`：**无**旧 slug 残留
- `server/api/*`：**无**旧 slug 残留
- `app/pages/courses/index.vue`：**无**旧 slug 残留
- 测试 fixture（`.spec.ts`/`.test.ts`）：**无**旧 slug 残留

### DOCUMENTATION / MIGRATION RECORD（允许保留旧 slug）

- `standards/`（ARCH-TAXONOMY-*、ARCH-PREREQUISITE-GRAPH-V1、ARCH-MANIFEST-CONTRACT-V2、ADR-0018 等）—— 设计/历史文档保留旧 slug 属正常，不计入问题
- `.workbuddy/audit/`（phase0-3 报告、plan-v1、prereq-graph-v1 等）—— 迁移记录，允许保留
- `PUBLISH-MIGRATION-REPORT.md`（content repo）—— V5 早期报告，MIGRATION RECORD

---

## 11. Orphan / Missing Analysis

| 检查项 | 结果 |
|---|---|
| Source 有但 Manifest 无的 chapter | 0 |
| Manifest 有但 Source 无的 chapter | 15（planned 空章，预期，非 orphan） |
| Package 有但 DB 无的 lesson | 0 |
| DB 有但 Package 无的 lesson | 0 |
| Source 有但 Package 无的 lesson | 0 |
| Package 有但 Source 无的 lesson | 0 |
| 重复 lesson identity | 0 |
| 重复 chapter identity | 0 |
| lesson 绑定无效 chapter | 0 |

**统计汇总**：
```
Topics   : source=6   manifest=6   package=6   db=6
Chapters : source=12* manifest=27  package=12* db=27   (* 含 lesson 的章；planned 空章 15 预期)
Lessons  : source=41  manifest=N/A package=41  db=41
Orphans  : 0 expected → 实测 0
Missing  : 0 expected → 实测 0
```

---

## 12. Known Issues

| # | 问题 | 位置 | 级别 | 影响 |
|---|---|---|---|---|
| K1 | 301 redirect 未实现 | 全仓无 middleware/route/nuxt.config | **DEFERRED** | 项目未上线无历史流量，不阻塞；上线前再确认 |
| K2 | 两层 route 与三层 identity 不匹配 | `app/pages/courses/[topicSlug]/[lessonSlug].vue` 等 | **P1** | lesson 页未进入 chapter 维度，与 Manifest/DB 结构冲突 |
| K3 | 首页知识地图 topic slug 陈旧 | `app/components/home/homeData.ts` | **P1** | 首页 topic 链接指向不存在的 topic；缺失 algebra/function |
| K4 | seed-v4 使用旧 taxonomy | `app/database/seeds/seed-v4.ts` | **P2** | 若重跑 seed 会与迁移后 DB 冲突（Phase 4 不处理） |

---

## 13. P0 / P1 / P2 / Deferred Classification

| 级别 | 项 | 说明 |
|---|---|---|
| **P0** | 无 | 数据迁移链路（Source/Manifest/Compiler/Package/DB）全部验证通过，无阻断项 |
| **P1** | K2（两层→三层 route） | 必须修复：实现三层路由 + 调用链 chapterSlug 透传（Phase 4 范围，见 `ARCH-TAXONOMY-MIGRATION-PHASE4-PLAN-V1.md`） |
| **P1** | K3（首页 topic slug） | 必须修复：homeData.ts 改用 `number`/`algebra`/`function`/`geometry`/`statistics`/`probability`，移除 `comprehensive-practice` |
| **P2** | K4（seed-v4 旧 taxonomy） | 可后续处理：更新 seed 至新 taxonomy 或标注 deprecated |
| **DEFERRED** | K1（301 redirect） | 项目未上线，无历史 URL/SEO/外链，不要求现在实现；上线前再次确认。不阻塞 Phase 3/4 |

---

## 14. Final Migration Readiness

**数据迁移层（Phase 1–3）已证明成立**：
- 41/41 lesson 编译通过，Manifest V2 Contract PASS
- 四方 Identity 一致性 PASS（Topics 6 / Chapters 27 / Lessons 41，0 orphan / 0 missing）
- Prerequisite 设计 dry-run PASS（DAG，无悬空）
- DB 孤儿/重复/旧 slug 残留检查全清
- Publish dry-run PASS（0 orphan / 0 dangling ref / 0 dangling prereq）

**运行时集成层存在 P1 未完成项**（K2 两层→三层 route、K3 首页 slug），但 **301（K1）已明确 Deferred，不阻塞**。

### 结论（数据层）：**READY**

```text
Data layer:    READY
Content repo:  READY for migration (commit 5afa589, 待 merge/push)
Runtime:       NOT READY
  └─ Route identity mismatch (两层 → 三层): P1
  └─ homeData taxonomy mismatch (旧 topic slug): P1
  └─ 301 redirect: DEFERRED — pre-launch project
```

> 数据迁移本身 READY。完整系统（Source→Compiler→Package→DB→**Runtime**）待 Phase 4 修复 K2/K3 后进入 READY。301（K1）不计入当前阻断项。
>
> Phase 4 修复路径（设计见 `ARCH-TAXONOMY-MIGRATION-PHASE4-PLAN-V1.md`）：
> 1. 新增三层路由 `app/pages/courses/[topicSlug]/[chapterSlug]/[lessonSlug].vue`，删除旧两层 route
> 2. 调用链透传 chapterSlug：`useLessonPage` → `lessonService.getLessonPage` → `lessonRepository.getWithTopicAndChapter`（第三参数可选）+ API `?chapter=`
> 3. 修正 `courses/index.vue` lesson 链接为三层
> 4. 修正 `homeData.ts` topicMap 为 6 个当前 topic，移除 comprehensive-practice
> 5. （不实现 301）nuxt.config / middleware 不加 redirect 规则
> 6. 上述修复后在主仓 `taxonomy-migration-20260822` 提交，再 merge main + push Gitee
>
> 当前 content 仓迁移 commit `5afa589` 已就绪，可保留；DB 已迁移且备有回滚快照。
