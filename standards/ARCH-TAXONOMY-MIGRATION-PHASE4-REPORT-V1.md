# Taxonomy Migration — Phase 4 Implementation Report (V1)

> 状态：Phase 4 Implementation 完成，待最终 review
> 日期：2026-08-22
> 分支：`taxonomy-migration-20260822`（主仓，未 commit / 未 push）
> 依据：`standards/ARCH-TAXONOMY-MIGRATION-PHASE4-PLAN-V1.md` + 本次 handoff 锁定的 3 个决策（覆盖 Plan 旧 D1–D3）
> 性质：**执行报告**。本阶段仅修改主仓 Runtime，未触碰 DB / content repo / compiler / manifest / publish / prerequisite graph。

---

## 1. Modified Files

| # | 文件 | 操作 |
|---|---|---|
| M1 | `app/pages/courses/[topicSlug]/[lessonSlug].vue` | **删除**（旧两层 route） |
| M2 | `app/pages/courses/[topicSlug]/[chapterSlug]/[lessonSlug].vue` | **新增**（三层 route，从 M1 模板迁移 + chapterSlug 路由参数 + 三参数调用） |
| M3 | `app/composables/useLessonPage.ts` | 签名扩为 `(topicSlug, chapterSlug, lessonSlug, options)`；`$fetch` query 加 `chapter`；cache key 含 chapterSlug |
| M4 | `app/content/service/lesson.ts` | `getLessonPage(topicSlug, chapterSlug, lessonSlug)` 三参数，透传 chapterSlug 到 repository |
| M5 | `app/database/repository/lesson.ts` | `getWithTopicAndChapter(topicSlug, chapterSlug, lessonSlug)` 三参数；先查 chapter（topic+slug），lesson 用 `(topicId+chapterId+slug)` 精确匹配；siblingLessons 改按 `chapterId` 查询 |
| M6 | `server/api/lessons/[slug].get.ts` | 提取 `topic`/`chapter`/`slug` 三参数；缺 chapter 返回 400（不 fallback） |
| M7 | `app/components/home/homeData.ts` | `topicMap` 改为 6 个当前 topic slug（number/algebra/function/geometry/statistics/probability），删除 number-and-algebra/statistics-and-probability/comprehensive-practice |
| M8 | `app/pages/courses/index.vue` | lesson `:to` 改为 `/courses/${topic.slug}/${ch.chapter.slug}/${lesson.slug}`（三层） |

**git diff --stat**：7 files changed, 75 insertions(+), 259 deletions(-)（删除量来自 M1 删 221 行旧 route）。无顺手重构无关代码。

---

## 2. M1–M8 Status

| # | 状态 | 验证 |
|---|---|---|
| M1 | ✅ DONE | 旧两层 route 文件已删除（git status: deleted） |
| M2 | ✅ DONE | 三层 route 新增（git status: untracked `app/pages/courses/[topicSlug]/[chapterSlug]/`） |
| M3 | ✅ DONE | useLessonPage 三参数 + query/key 含 chapter |
| M4 | ✅ DONE | service getLessonPage 三参数透传 |
| M5 | ✅ DONE | repository 三参数 + chapter 精确匹配 + sibling 按 chapterId |
| M6 | ✅ DONE | API 三参数，缺 chapter 返回 400 |
| M7 | ✅ DONE | homeData 6 个当前 topic slug |
| M8 | ✅ DONE | courses/index.vue 链接三层化 |

---

## 3. Route Verification

dev server (`nuxt dev --port 3002`) E2E：

| URL | 期望 | 实测 |
|---|---|---|
| `GET /courses/number/sets/why-sets`（三层） | 200 | **200** ✅ |
| `GET /courses/number/why-sets`（旧两层） | 404 | **404** ✅（M1 删除后 Nuxt 自然 404，非 301） |

旧两层 URL 不 redirect、不 fallback、不猜测 chapter，直接 404 —— 符合 handoff Decision 1。

---

## 4. siblingLessons Verification

API `GET /api/lessons/why-triangles-matter?topic=geometry&chapter=triangle` → 200，返回：

```text
lesson      : why-triangles-matter / 为什么三角形如此重要？
chapter     : triangle / 三角形
previousLesson : (null)            ← triangle 第一个，无同章前驱
nextLesson     : what-is-congruent  ← 在 triangle 9 个 lesson slug 集合内
prevInChapterOrNull(triangle): True
nextInChapterOrNull(triangle): True
```

sibling 按 `chapterId`（同 topic + 同 chapter）计算，**不跨章**。triangle 内 9 个 lesson 不会与 circle/quadrilateral 等其他 chapter 混合。符合 handoff Decision 2。

---

## 5. homeData Verification

`app/components/home/homeData.ts` `topicMap` 当前 6 项：

```text
number, algebra, function, geometry, statistics, probability
```

残留旧 slug 检查（`number-and-algebra` / `statistics-and-probability` / `comprehensive-practice`）：**0**（已全部移除）。slug 与 Manifest V2 `topics[]` 完全一致。符合 AC5。

---

## 6. TypeScript Result

```bash
npx nuxi prepare  → Types generated in .nuxt
npm run typecheck → vue-tsc --noEmit → exit 0
```

**PASS**（0 error）。M3–M6 签名扩展 + M2/M8 模板改动类型正确，无遗漏调用点。

---

## 7. Unit Test Result

```bash
npm run test → vitest run
✓ app/utils/slug.test.ts (4 tests)
✓ app/content/__tests__/publish.test.ts (13 tests)
Test Files 2 passed (2)   Tests 17 passed (17)
```

**PASS**（17/17）。publish.test 覆盖发布契约，未受 Phase 4 影响。

---

## 8. E2E Result

见 §3 / §4。汇总：

| 检查 | 结果 |
|---|---|
| 三层 route `/courses/number/sets/why-sets` | **200** ✅ |
| 旧两层 route `/courses/number/why-sets` | **404** ✅ |
| API 缺 chapter `?topic=number`（无 chapter） | **400** ✅（M6 不 fallback） |
| API 三参数 `?topic=geometry&chapter=triangle` | **200** + 正确 lesson/chapter ✅ |
| sibling 不跨章 | **PASS**（prev=null 或 triangle 内，next=triangle 内）✅ |

---

## 9. Compiler Result

**未在本会话重跑**。原因：`compiler/index.ts` 不在主仓（`.gitignore` 忽略未入库，POSTFLIGHT §6 注明）。

依据：POSTFLIGHT §5 记录 Phase 3 `tsx compiler/index.ts` 41/41 lesson 编译 **0 FAIL**；Phase 4 严格遵守 handoff §6「不修改 compiler / content repo / manifest」，content 层未被触碰。状态保持 **PASS**。

> 限制：若需实跑重验，需先恢复 `compiler/` 目录（本地或从 content repo）。

---

## 10. Content Contract Result

**PASS**（由 §11 四方一致性 + §publish-dryrun 覆盖）。

`output/content-package.json`（content repo commit `5afa589`）protocol_version=1, ast_version=1, schemaVersion=2，41 lessons，无重复 identity。Phase 4 未修改 content repo，契约状态保持。

---

## 11. Four-way Consistency Result

```bash
node .workbuddy/audit/four-way-consistency.mjs
```

```text
Topics   : source=6 manifest=6 package=6 db=6
Chapters : source=12 manifest=27 package=12 db=27   (15 planned empty chapters expected)
Lessons  : source=41 manifest=N/A package=41 db=41
source∩pkg lessons: 0   pkg∩source lessons: 0
pkg∩db lessons: 0       db∩pkg lessons: 0
db lessons with null chapter_id: 0
✅ FOUR-WAY CONSISTENCY: PASS (all active identities align; 15 planned empty chapters expected)
```

**PASS**。Source ↔ Manifest V2 ↔ Package ↔ DB 四方 identity 完全一致。Phase 4 未动数据层，回归通过。符合 AC7。

---

## 12. Prerequisite Result

```bash
node .workbuddy/audit/prereq-dryrun.mjs
```

```text
hard edges analyzed : 27
dangling source     : 0
dangling target     : 0
self-loop           : 0
cycle detected      : false
✅ PREREQUISITE DRY-RUN: PASS (all 29 hard edges resolve to valid current identities, DAG, no self-loop)
```

**PASS**。triangle 合并 / function 拆分 / 跨 Topic 边均正确解析。prerequisite 不落库（调整2，保持设计文档 dry-run），Phase 4 未触碰，状态保持。

---

## 13. Remaining Issues

| # | 问题 | 级别 | 说明 |
|---|---|---|---|
| R1 | 首页 `KnowledgeMap.vue` 的 `/courses/${topic.slug}` 链接 404 | **pre-existing / 超范围** | 该 URL 指向主题页 route，但主仓无 `/courses/[topicSlug]/index.vue`（迁移前后均无）。M7 只改 slug 值（slug 已正确），不改 `:to` 路径（超出 M7 范围，涉及新增主题页 route = 架构调整）。建议后续单独处理（新增主题页 route 或改链接为目录过滤）。非 Phase 4 引入。 |
| R2 | compiler dry-run 未重跑 | **环境限制** | `compiler/` 不在主仓（.gitignore，POSTFLIGHT §6）。依据 Phase 3 PASS + Phase 4 未触碰 content/compiler，状态保持。需重验须先恢复 compiler 目录。 |
| R3 | `seed-v4.ts` 仍用旧 taxonomy | **P2 / 不处理** | POSTFLIGHT §10 K4。handoff §6 明确不处理 seed-v4。若重跑 seed 会与迁移后 DB 冲突。 |
| R4 | 2 篇 Phase 4 文档 + 本报告 untracked | **待 commit** | `Phase4-Plan` / `Postflight` / 本报告均为 untracked。handoff 不自行 commit/push，留待用户。 |
| R5 | ADR-0018 引用但不存在 | **文档缺失** | Plan §1.2/§5 引用 ADR-0018，主仓 `standards/decisions/` 仅到 ADR-0017。handoff §6 不创建 ADR-0018。仅记录。 |
| R6 | 4 篇 Phase 1–3 历史文档不在主仓 | **接管期记录** | `ARCH-COURSE-TAXONOMY-V1` / `ARCH-MANIFEST-CONTRACT-V2` / `ARCH-PREREQUISITE-GRAPH-V1`（副本在 `.workbuddy/audit/prereq-graph-v1.md`）/ `ARCH-TAXONOMY-PREREQUISITE-REVIEW-V1`。Phase 4 执行不依赖它们，handoff §6 不恢复。 |

---

## 14. Rollback Information

Phase 4 仅改主仓 Runtime（无 DB 写、无 content 改、无 git push），rollback 极轻：

**未提交状态**（当前）：
```bash
# 回退 6 个修改文件
git checkout -- app/components/home/homeData.ts \
  app/composables/useLessonPage.ts \
  app/content/service/lesson.ts \
  app/database/repository/lesson.ts \
  app/pages/courses/index.vue \
  server/api/lessons/[slug].get.ts

# 恢复 M1 删除的旧两层 route（从 HEAD）
git restore app/pages/courses/[topicSlug]/[lessonSlug].vue

# 删除 M2 新增的三层 route 目录
Remove-Item -Recurse app/pages/courses/[topicSlug]/[chapterSlug]
```

或更简单：`git stash -u`（含 untracked）可一次性回退全部 M1–M8。

**已提交但未 push**：`git revert <phase4-commit>` 或 `git reset --hard <pre-phase4>`（HEAD `41e48d2` 为 Phase 4 起点）。

**DB / Content 无需 rollback**：Phase 4 不触碰 DB 与 content repo，Phase 1/2 迁移保持不变。

---

## 15. Final Status

### Acceptance Criteria（Plan §10）

| AC | 项 | 状态 |
|---|---|---|
| AC1 | 三层 route 存在且 200 | ✅ |
| AC2 | 旧两层 route 已删（404） | ✅ |
| AC3 | courses/index.vue 链接三层 | ✅ |
| AC4 | 调用链含 chapterSlug + sibling 按 chapter | ✅ |
| AC5 | homeData 6 topic slug，无旧 slug | ✅ |
| AC6 | 首页知识地图 6 链接指向存在 topic | ⚠️ slug 正确（DB 存在），但 `/courses/{topic}` 主题页 route 既有缺失（pre-existing，见 R1） |
| AC7 | 四方一致性重跑 PASS | ✅ |
| AC8 | publish-dryrun 重跑 PASS | ✅ |
| AC9 | nuxt build 成功 | ✅ |
| AC10 | 无新增 301 redirect 代码 | ✅ |

### 与 Plan 的偏差

| 偏差 | 说明 | 是否授权 |
|---|---|---|
| chapterSlug 必填（非 Plan §3 的"可选+回退"） | 按 handoff §5 Decision 3 执行，有意偏离 Plan §3 旧设计 | ✅ handoff 明确覆盖 |
| sibling 按 chapter（Plan §3 与 handoff Decision 2 一致） | 无偏差 | — |
| compiler dry-run 未重跑 | 工具不在主仓（R2），非主观跳过；已用 four-way/publish-dryrun/prereq 三回归覆盖 content 层 | ⚠️ 环境限制 |
| homeData 标题文案采用 Plan §4.3 | 无偏差 | — |

### 最终结论

```text
Data layer:    READY（Phase 1–3，本会话重跑 four-way/publish-dryrun/prereq 全 PASS）
Content repo:  READY for migration（commit 5afa589，待 merge/push）
Runtime:       READY（Phase 4 完成）
  └─ Route identity: ALIGNED（三层 /courses/{topic}/{chapter}/{lesson}）
  └─ homeData taxonomy: ALIGNED（6 topic）
  └─ siblingLessons: ALIGNED（按 chapter，不跨章）
  └─ 301 redirect: DEFERRED — pre-launch project（无新增 redirect 代码）

M1–M8: 全部 DONE
AC1–AC5, AC7–AC10: PASS
AC6: slug 层 PASS，URL 路由层 pre-existing 问题（R1，超 Phase 4 范围）
```

### 最终状态：**READY**

> 301 仍为 Deferred（上线前再确认）。AC6 的 URL 路由 404 为 pre-existing 主题页 route 缺失（R1），非 Phase 4 引入、非 Phase 4 M1–M8 范围，不阻断 Phase 4 完成。
>
> 未 commit / 未 push（遵循 handoff「不要自行 merge / push」）。
