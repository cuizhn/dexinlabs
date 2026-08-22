# Taxonomy Migration — Phase 4 修复设计 (V1)

> 状态：修复设计（**尚未执行代码修改**）
> 日期：2026-08-22
> 依赖：Phase 1–3 已完成且数据层 READY；本报告审核通过后再进入代码修改。
> 性质：**设计文档**。本文档不修改任何代码；所有改动在 Phase 4 执行阶段完成。

---

## 0. 当前状态（用户确认）

```text
Data layer:    READY
Content repo:  READY for migration (commit 5afa589, 待 merge/push)
Runtime:       NOT READY
  └─ Route identity mismatch (两层 → 三层): P1
  └─ homeData taxonomy mismatch (旧 topic slug): P1
  └─ 301 redirect: DEFERRED — pre-launch project
```

**301 redirect 不作为当前 P1 修复项。** 项目尚未上线，无历史 URL、SEO 索引或外部链接，因此不要求现在实现 runtime redirect。旧→新 URL 映射仍保留于本文档 §5，但 runtime redirect 标记为 `Deferred — pre-launch project`，在正式上线前再次确认是否需要实现。

当前真正需要修复的是：
```text
Runtime route identity (两层 → 三层)
+
homeData topic taxonomy (旧 slug → 当前 6 topic)
```

---

## 1. 两层 → 三层 Route 的影响面

### 1.1 当前 URL 结构（两层，迁移前）

```
/courses/{topicSlug}/{lessonSlug}
```

示例：`/courses/number/why-sets`（topic=number, lesson=why-sets）

### 1.2 目标 URL 结构（三层，ADR-0018 + Manifest V2）

```
/courses/{topicSlug}/{chapterSlug}/{lessonSlug}
```

示例：`/courses/number/sets/why-sets`（topic=number, chapter=sets, lesson=why-sets）

### 1.3 影响面清单

| 层 | 文件 | 当前形态 | 是否受影响 |
|---|---|---|---|
| Route 文件 | `app/pages/courses/[topicSlug]/[lessonSlug].vue` | 两层目录 | **是**（改为三层目录） |
| 目录页 | `app/pages/courses/index.vue` | lesson 链接两层 | **是**（链接改为三层） |
| Composable | `app/composables/useLessonPage.ts` | 调用两参数 API | **是**（传 chapterSlug） |
| Service | `app/content/service/lesson.ts` | `getLessonPage(topic, slug)` | **是**（加 chapterSlug 参数） |
| Repository | `app/database/repository/lesson.ts` | `getWithTopicAndChapter(topic, slug)` | **是**（加 chapterSlug 第三参数） |
| API | `server/api/lessons/[slug].get.ts` | 两参数 query | **是**（加 `chapter` query） |
| API route 文件 | `server/api/lessons/[slug].get.ts` | 单 slug 路由 | 否（仍按 lesson slug 解析） |
| 课程目录 API | `server/api/courses/index.get.ts` | 返回三层 catalog | 否（已正确返回 Topic→Chapter→Lesson） |
| Course Service | `app/content/service/course.ts` | 组装 catalog | 否（已三层） |
| Topics API | `server/api/topics/[slug].get.ts` | 含 chapters 列表 | 否（已返回 chapters） |
| DB Schema | drizzle `lessons.chapterId` | 已迁移绑定 chapter | 否（Phase 2 已完成） |

**结论**：影响面集中在"lesson 解析链路"（route → composable → service → repository → API），共 5 个文件需改；catalog/目录数据链路（course service / courses API / topics API / DB）已正确，不需改。

---

## 2. 现有调用链（两层，现状）

```text
[浏览器] /courses/{topic}/{lesson}
   │
   ▼
app/pages/courses/[topicSlug]/[lessonSlug].vue
   ├─ useRouteParam('topicSlug')  → topicSlug
   ├─ useRouteParam('lessonSlug') → lessonSlug
   └─ useLessonPage(topicSlug, lessonSlug)
         │
         ▼  $fetch(`/api/lessons/${lessonSlug}?topic=${topicSlug}`)
         │
         ▼
server/api/lessons/[slug].get.ts
   ├─ getRouterParam('slug')        → lessonSlug
   ├─ getQuery('topic')             → topicSlug
   └─ lessonService.getLessonPage(topic, slug)
         │
         ▼
app/content/service/lesson.ts :: getLessonPage(topicSlug, lessonSlug)
   └─ lessonRepository.getWithTopicAndChapter(topicSlug, lessonSlug)
         │
         ▼
app/database/repository/lesson.ts :: getWithTopicAndChapter(topicSlug, lessonSlug)
   ├─ db.query.topics.findFirst(slug=topicSlug)
   ├─ db.query.lessons.findFirst(topicId + slug=lessonSlug)  with {topic, chapter}
   ├─ db.select lessons where topicId  → siblingLessons (同 topic 全部)
   └─ return {lesson, topicEntity, chapterEntity, siblingLessons}
```

**注意点**：
- `siblingLessons` 当前按 **topic 维度** 计算前后课时（同 topic 下所有 lesson 排序）。
- 三层结构下，兄弟课时语义应为 **chapter 维度**（同 chapter 内 lesson 排序），否则跨 chapter 的"上一课/下一课"会跳章。§7 测试范围会覆盖此语义变更。

---

## 3. 目标调用链（三层，设计）

```text
[浏览器] /courses/{topic}/{chapter}/{lesson}
   │
   ▼
app/pages/courses/[topicSlug]/[chapterSlug]/[lessonSlug].vue   ← 新目录
   ├─ useRouteParam('topicSlug')
   ├─ useRouteParam('chapterSlug')
   ├─ useRouteParam('lessonSlug')
   └─ useLessonPage(topicSlug, chapterSlug, lessonSlug)        ← 签名扩展
         │
         ▼  $fetch(`/api/lessons/${lessonSlug}?topic=${topicSlug}&chapter=${chapterSlug}`)
         │
         ▼
server/api/lessons/[slug].get.ts
   ├─ getRouterParam('slug')       → lessonSlug
   ├─ getQuery('topic')            → topicSlug
   ├─ getQuery('chapter')          → chapterSlug  (新增，可选)
   └─ lessonService.getLessonPage(topic, chapter, slug)
         │
         ▼
app/content/service/lesson.ts :: getLessonPage(topicSlug, chapterSlug, lessonSlug)
   └─ lessonRepository.getWithTopicAndChapter(topicSlug, lessonSlug, chapterSlug?)
         │
         ▼
app/database/repository/lesson.ts :: getWithTopicAndChapter(topicSlug, lessonSlug, chapterSlug?)
   ├─ db.query.topics.findFirst(slug=topicSlug)
   ├─ db.query.lessons.findFirst(topicId + slug=lessonSlug + [chapterId join])  with {topic, chapter}
   ├─ db.select lessons where chapterId = result.chapterId  → siblingLessons (同 chapter)
   └─ return {lesson, topicEntity, chapterEntity, siblingLessons}
```

**设计决策**：
- `chapterSlug` 在 API 与 repository 中作为 **可选参数**（向后兼容）。提供时用于精确解析 + 同 chapter 兄弟计算；不提供时回退到 `(topic, lesson)` 解析（兼容潜在的旧链接/内部调用）。
- 三层 route 文件为 **新增**（`[topicSlug]/[chapterSlug]/[lessonSlug].vue`），旧两层文件 `[topicSlug]/[lessonSlug].vue` **删除**（因 301 暂缓，旧 URL 不跳转，但两层 route 与新 identity 冲突，必须移除避免歧义）。
  - 替代方案（不推荐）：保留两层文件返回 404。但两层 route 与三层 Manifest/DB 结构不匹配，保留会造成"可访问但语义错误"的脏状态，故选择删除。

---

## 4. `homeData.ts` 旧 Topic 引用及新 Topic 映射

### 4.1 现状（homeData.ts:95-116 `topicMap`）

| 旧 slug（错误） | 问题 |
|---|---|
| `number-and-algebra` | 已拆分为 `number` + `algebra`，此 slug 不存在 |
| `geometry` | 存在，但应为当前 6 topic 之一（正确值） |
| `statistics-and-probability` | 已拆分为 `statistics` + `probability`，此 slug 不存在 |
| `comprehensive-practice` | 整章已删（Phase 1），此 slug 不存在 |
| （缺失）`algebra` | 未列出 |
| （缺失）`function` | 未列出 |
| （缺失）`number` | 未列出 |
| （缺失）`statistics` | 未列出 |
| （缺失）`probability` | 未列出 |

### 4.2 新映射（对齐 Manifest V2 `topics[]`）

| 旧 slug | → 新 slug | 标题（Manifest V2） |
|---|---|---|
| `number-and-algebra` | `number` | 数与代数（数） |
| `number-and-algebra` | `algebra` | 代数 |
| （新增） | `function` | 函数 |
| `geometry` | `geometry` | 图形与几何（保持不变） |
| `statistics-and-probability` | `statistics` | 统计 |
| `statistics-and-probability` | `probability` | 概率 |
| `comprehensive-practice` | （删除，不映射） | — |

### 4.3 homeData.ts 修正后 topicMap（6 项）

```ts
export const topicMap: { slug: string, title: string, description: string }[] = [
  { slug: 'number',    title: '数与代数（数）', description: '有理数、实数、集合' },
  { slug: 'algebra',   title: '代数',           description: '代数式、方程与不等式' },
  { slug: 'function',  title: '函数',           description: '函数概念、一次函数、反比例函数' },
  { slug: 'geometry',  title: '图形与几何',     description: '三角形、四边形、圆、相似与全等' },
  { slug: 'statistics',title: '统计',           description: '数据收集、数据分析' },
  { slug: 'probability',title: '概率',          description: '随机事件与概率' }
]
```

> 注：`homeData.ts` 标题文案为首页视觉实验展示用，可保留业务语言；但 **slug 必须与 Manifest V2 完全一致**，否则首页知识地图链接 404。

---

## 5. 旧 → 新 URL 映射（保留记录，runtime redirect = Deferred）

以下映射 **记录备查**，但 **当前不实现 runtime redirect**（301 暂缓）。

| 旧 URL（两层） | 新 URL（三层） |
|---|---|
| `/courses/number-and-algebra/rational-numbers/*` | `/courses/number/number-system/*` |
| `/courses/number-and-algebra/functions/*` | `/courses/function/function-concept/*` |
| `/courses/number-and-algebra/linear-functions/*` | `/courses/function/linear-function/*` |
| `/courses/algebra/algebraic-expressions/*` | `/courses/algebra/algebraic-expression/*` |
| `/courses/algebra/linear-equations/*` | `/courses/algebra/linear-equation/*` |
| `/courses/geometry/geometry-basics/*` | `/courses/geometry/geometric-foundation/*` |
| `/courses/geometry/coordinate-system/*` | `/courses/geometry/coordinate-geometry/*` |
| `/courses/geometry/triangles/*` | `/courses/geometry/triangle/*` |
| `/courses/geometry/congruent-triangles/*` | `/courses/geometry/triangle/*` |
| `/courses/geometry/pythagorean-theorem/*` | `/courses/geometry/triangle/*` |
| `/courses/statistics-and-probability/probability/*` | `/courses/probability/random-event-and-probability/*` |

**Runtime redirect 状态**：`Deferred — pre-launch project`

> 上线前再次确认：若项目已上线且有外部链接/SEO 索引，则实现 11 类 301（middleware 或 nuxt.config router 规则）；若仍无外部暴露，可继续暂缓。

---

## 6. 必须修改的代码

| # | 文件 | 修改内容 |
|---|---|---|
| M1 | `app/pages/courses/[topicSlug]/[lessonSlug].vue` | **删除**（两层 route 与新 identity 冲突） |
| M2 | `app/pages/courses/[topicSlug]/[chapterSlug]/[lessonSlug].vue` | **新增**（三层 route，从 M1 迁移模板，增加 `useRouteParam('chapterSlug')`） |
| M3 | `app/composables/useLessonPage.ts` | 签名扩为 `(topicSlug, chapterSlug, lessonSlug)`；`$fetch` query 加 `chapter`；key 含 chapterSlug |
| M4 | `app/content/service/lesson.ts` | `getLessonPage(topicSlug, chapterSlug, lessonSlug)` 透传 chapterSlug |
| M5 | `app/database/repository/lesson.ts` | `getWithTopicAndChapter(topicSlug, lessonSlug, chapterSlug?)` 第三参数可选；siblingLessons 改为按 chapterId 计算 |
| M6 | `server/api/lessons/[slug].get.ts` | `getQuery('chapter')` 提取 chapterSlug，传给 service（可选） |
| M7 | `app/components/home/homeData.ts` | `topicMap` 改为 6 个当前 topic slug（§4.3） |
| M8 | `app/pages/courses/index.vue` | lesson `:to` 改为 `/courses/${topic.slug}/${chapter.slug}/${lesson.slug}`（第 36 行） |

---

## 7. 明确不应修改的代码

| 文件 / 范围 | 理由 |
|---|---|
| `server/api/courses/index.get.ts` | 已正确返回三层 catalog，不需改 |
| `app/content/service/course.ts` | 已正确组装 Topic→Chapter→Lesson，不需改 |
| `server/api/topics/[slug].get.ts` | 已返回 chapters 列表，不需改 |
| `app/database/repository/chapter.ts` / `topic.ts` | 数据层已迁移，不需改 |
| DB Schema / drizzle migration | Phase 2 已完成，`lessons.chapterId` 已绑定，不回退 |
| `compiler/` / `content-manifest.json` / `lessons/` | Phase 1 已完成，内容层 READY，不碰 |
| `app/content/service/publish.ts` | 发布链路已 V2 对齐，不碰 |
| `nuxt.config.ts` router | **不添加 301 redirect 规则**（301 暂缓） |
| 任何 middleware / server plugin | **不实现 301 redirect**（301 暂缓） |
| `seed-v4.ts` | P2，Phase 4 不处理（可后续单独更新或标注 deprecated） |

---

## 8. 测试范围

### 8.1 单元 / 集成
- `app/database/repository/lesson.ts`：
  - `getWithTopicAndChapter(topic, lesson, chapter)` 精确解析（chapter 维度）
  - `getWithTopicAndChapter(topic, lesson)` 回退解析（无 chapter）仍可用
  - 同 chapter 兄弟计算：返回同 chapterId 下有序 lesson，不含跨 chapter
- `app/content/service/lesson.ts`：`getLessonPage` 三参数透传 + 返回 `chapter` 非空

### 8.2 路由 / E2E（Nuxt test）
- 访问 `/courses/number/sets/why-sets` → 200，渲染 lesson 标题
- 访问旧两层 `/courses/number/why-sets` → **404**（M1 删除后 Nuxt 自然 404，非 301）
- `app/pages/courses/index.vue` 点击 lesson 链接 → 跳转三层 URL
- 首页知识地图 `topicMap` 6 个链接 → 均指向存在的 topic（`/courses/{slug}` 目录过滤或首页）

### 8.3 一致性回归
- 重跑 Phase 3 四方一致性（four-way-consistency.mjs）→ 仍 PASS（未改数据层）
- 重跑 publish-dryrun.mjs → 仍 PASS（0 orphan / 0 dangling）

---

## 9. Rollback 方案

Phase 4 仅改主仓 runtime 代码（无 DB 写、无 content 改、无 git push），rollback 极轻：

1. **未提交状态**：`git checkout -- app/pages/courses app/composables/useLessonPage.ts app/content/service/lesson.ts app/database/repository/lesson.ts server/api/lessons/[slug].get.ts app/components/home/homeData.ts` 即可回退全部 M1–M8。
2. **已提交但未 push**：`git revert <phase4-commit>` 或 `git reset --hard <pre-phase4>`（主仓当前分支 `taxonomy-migration-20260822` 独立，不影响 content repo 或 DB）。
3. **DB / Content 无需 rollback**：Phase 4 不触碰 DB 与 content repo，Phase 2/Phase 1 迁移保持不变。
4. **验证 rollback 后**：`nuxt dev` 访问旧两层 URL 恢复可访问（若 M1 未删）或保持 404（若 M1 已删——需确认产品意图）。

> 注意：M1 删除两层 route 后，旧两层 URL 将 404。这是预期行为（301 暂缓、无历史流量）。若产品要求"旧 URL 暂不停服"，则 M1 改为保留两层 route 返回 404 页面而非删除——此决策待审核时确认（当前默认删除）。

---

## 10. Phase 4 完成验收条件

所有以下条件满足，方可标记 Phase 4 完成、Runtime 进入 READY：

- [ ] **AC1**：三层 route `app/pages/courses/[topicSlug]/[chapterSlug]/[lessonSlug].vue` 存在且可渲染真实 lesson（取 DB 中任一 `(topic, chapter, lesson)` 三元组验证 200）。
- [ ] **AC2**：旧两层 route 文件已移除（或明确改为 404），无歧义残留。
- [ ] **AC3**：`courses/index.vue` 全部 lesson 链接为三层形态，点击可正确跳转。
- [ ] **AC4**：`useLessonPage` / `lessonService.getLessonPage` / `lessonRepository.getWithTopicAndChapter` 签名含 chapterSlug，且兄弟课时按 chapter 维度计算（同 chapter 有序，不跨章）。
- [ ] **AC5**：`homeData.ts` `topicMap` 含 6 个当前 topic slug（`number`/`algebra`/`function`/`geometry`/`statistics`/`probability`），无 `number-and-algebra`/`statistics-and-probability`/`comprehensive-practice` 残留。
- [ ] **AC6**：首页知识地图 6 个链接均指向存在的 topic（无 404）。
- [ ] **AC7**：四方一致性重跑 PASS（数据层未受影响）。
- [ ] **AC8**：publish-dryrun 重跑 PASS（0 orphan / 0 dangling）。
- [ ] **AC9**：`nuxt build` 成功（无 TS / lint 错误）。
- [ ] **AC10**：无新增 301 redirect 代码（301 仍 Deferred，符合本设计）。

### 验收后状态

```text
Data layer:    READY
Content repo:  READY for migration
Runtime:       READY (Phase 4 完成)
  └─ Route identity: ALIGNED (三层)
  └─ homeData taxonomy: ALIGNED (6 topic)
  └─ 301 redirect: DEFERRED — pre-launch project
```

> 注：301 仍为 Deferred。即使 Runtime READY，上线前需再次确认 301 是否实现（见 §5）。当前阶段不阻塞。

---

## 11. 待审核决策点

| 决策 | 选项 | 默认建议 |
|---|---|---|
| D1：M1 旧两层 route 删除 vs 保留 404 | 删除 / 保留返回 404 | **删除**（避免脏状态） |
| D2：siblingLessons 语义 | 按 chapter（推荐）/ 按 topic | **按 chapter**（三层语义） |
| D3：chapterSlug API 参数 | 可选（推荐）/ 必填 | **可选**（向后兼容） |

审核通过后进入 Phase 4 执行阶段。
