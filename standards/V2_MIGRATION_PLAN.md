## V2 架构迁移执行方案

从 Course → Chapter → Lesson 迁移到 Domain → Topic → Lesson。
本文档基于现有代码全量分析编写，包含具体文件路径、代码变更和验证步骤。

---

### 一、迁移总览

#### 影响范围统计

| 类别 | 需重命名 | 需改内容 | 需新建 |
|------|:---:|:---:|:---:|
| 数据库 schema | 0 | 1 | 0 |
| 模型类型 | 0 | 1 | 0 |
| 仓储层 | 2 文件 | 4 文件 | 0 |
| 服务层 | 2 文件 | 4 文件 | 0 |
| Content 工具/入口 | 0 | 2 | 0 |
| Server API | 4 目录+文件 | 6 文件 | 0 |
| 页面 | 4 目录+文件 | 6 文件 | 1（/map） |
| 组合式函数 | 2 文件 | 3 文件 | 0 |
| 组件 | 0 | 3 | 0 |
| 迁移文件 | 0 | 0 | 1 |
| **合计** | **~14** | **~30** | **2** |

#### 核心概念映射

| 旧概念 | 新概念 | 说明 |
|--------|--------|------|
| Course | Domain | 知识领域（数与代数、图形与几何、统计与概率） |
| Chapter | Topic | 知识主题（函数、方程、圆、三角形） |
| Lesson | Lesson | 最小学习单元（保持不变） |
| Exercise | Exercise | 主题练习（保持，外键从 chapter 改为 topic） |

#### URL 结构变更

```
旧：/course/algebra/function/linear-function
新：/algebra/function/linear-function
```

注意：Domain slug 成为 URL 第一级。需确保不与 `/about`、`/study`、`/methods`、`/exercise` 等静态页面冲突。当前 slug 值（algebra、geometry、statistics）与现有页面路径无冲突。

---

### 二、Phase 1 — 数据模型迁移

#### 2.1 Schema 变更

文件：`app/database/schema.ts`

**courses 表 → domains 表**

```
表名：courses → domains
列精简：仅保留 id, slug, title, description, order
  删除：summary, cover, edition, body, createdAt, updatedAt
  新增：description (text) — 替代原 summary 字段，语义更清晰
索引重命名：
  idx_courses_slug_unique → idx_domains_slug_unique
  idx_courses_order → idx_domains_order
关系名：coursesRelations → domainsRelations
关系字段：chapters → topics
```

Domain 是知识体系的顶层分类节点，不是内容实体。
不需要 cover、body、edition 等课程展示字段。

**chapters 表 → topics 表**

```
表名：chapters → topics
列重命名：
  course (varchar) → domain (varchar)       — DB 列名 course_slug → domain_slug
  courseId (integer) → domainId (integer)    — DB 列名 course_id → domain_id
索引重命名：
  idx_chapters_slug_unique → idx_topics_slug_unique
  idx_chapters_course_id → idx_topics_domain_id
  idx_chapters_order → idx_topics_order
  idx_chapters_course_slug → idx_topics_domain_slug
关系名：chaptersRelations → topicsRelations
关系字段：courseRef → domainRef
```

**lessons 表**

```
列重命名：
  chapter (varchar) → topic (varchar)        — DB 列名 chapter_slug → topic_slug
  chapterId (integer) → topicId (integer)    — DB 列名 chapter_id → topic_id
索引重命名：
  idx_lessons_chapter_id → idx_lessons_topic_id
  idx_lessons_chapter_slug → idx_lessons_topic_slug
关系字段：chapterRef → topicRef
嵌套关系：chapterRef.courseRef → topicRef.domainRef
```

**exercises 表**

```
列重命名：
  chapter (varchar) → topic (varchar)
  chapterId (integer) → topicId (integer)
索引重命名：
  idx_exercises_chapter_id → idx_exercises_topic_id
  idx_exercises_chapter_slug → idx_exercises_topic_slug
关系字段：chapterRef → topicRef
```

#### 2.2 数据库迁移策略

当前状态：`_journal.json` 的 `entries` 为空，无历史迁移记录。

方案选择：

- **方案 A（推荐）**：因当前无生产数据需保留，直接 `drizzle-kit push` 将 schema 变更同步到开发数据库，然后生成初始迁移。
- **方案 B**：编写手动 SQL 迁移（`ALTER TABLE ... RENAME`），保留现有数据。适用于已有需要保留的数据。

执行步骤（方案 A）：

```bash
# 1. 修改 schema.ts
# 2. 同步到开发数据库
npx drizzle-kit push
# 3. 生成初始迁移
npx drizzle-kit generate
```

#### 2.3 Seed 数据

当前无 seed 文件。需新建 `app/database/seeds/domains.ts`：

```typescript
import { domains } from '../schema'

export const domainSeeds = [
  { slug: 'algebra', title: '数与代数', description: '数与代数领域的核心内容', order: 1 },
  { slug: 'geometry', title: '图形与几何', description: '图形与几何领域的核心内容', order: 2 },
  { slug: 'statistics', title: '统计与概率', description: '统计与概率领域的核心内容', order: 3 }
]
```

通过 `drizzle-kit seed` 或自定义脚本插入。

#### 2.4 模型类型变更

文件：`app/content/models/index.ts`

```
Course → Domain
  - 精简为分类节点：id, slug, title, description, order
  - 字段变更：chapters → topics
  - 删除：summary, cover, edition, body, createdAt, updatedAt

Chapter → Topic
  - 字段变更：course → domain, courseId → domainId

Lesson
  - 字段变更：chapter → topic, chapterId → topicId

Exercise
  - 字段变更：chapter → topic, chapterId → topicId

ChapterListOptions → TopicListOptions
  - 字段变更：course → domain, courseSlug → domainSlug

ChapterPage → TopicPage
  - 字段变更：chapter → topic, course → domain
  - 字段变更：previousChapter → previousTopic, nextChapter → nextTopic

CoursePage → DomainPage
  - 字段变更：course → domain, chapters → topics
```

#### 2.5 Phase 1 验证

```bash
npx nuxi typecheck   # 零错误
# 检查数据库表结构
npx drizzle-kit studio  # 确认 domains/topics/lessons/exercises 表正确
```

---

### 三、Phase 1.5 — 仓储层与服务层迁移

#### 3.1 仓储层

**文件重命名**

```
CourseRepository.ts → DomainRepository.ts
ChapterRepository.ts → TopicRepository.ts
```

**DomainRepository.ts 变更**

```
类名：CourseRepository → DomainRepository
导入：courses → domains
方法：getWithChaptersAndLessons → getWithTopicsAndLessons
类型：Course → Domain, Chapter → Topic, Lesson 保持
关联查询 with 字段：chapters → topics
```

**TopicRepository.ts 变更**

```
类名：ChapterRepository → TopicRepository
导入：chapters → topics
方法：listByCourse → listByDomain
方法：getWithLessonsAndCourse → getWithLessonsAndDomain
接口：ChapterWithRelations → TopicWithRelations
内部字段：courseEntity → domainEntity, siblingChapters → siblingTopics
关联查询 with 字段：courseRef → domainRef
```

**LessonRepository.ts 变更**

```
方法：listByChapter → listByTopic
方法：getWithChapterAndCourse → getWithTopicAndDomain
接口字段：chapterEntity → topicEntity, courseEntity → domainEntity, siblingLessons 保持
关联查询 with 字段：chapterRef → topicRef, chapterRef.courseRef → topicRef.domainRef
```

**ExerciseRepository.ts 变更**

```
ExerciseFilters：chapter → topic, chapterId → topicId
方法：listByChapter → listByTopic, getOneByChapter → getOneByTopic
参数名：chapterSlug → topicSlug
```

**repositories/index.ts 变更**

```
所有导出名：CourseRepository → DomainRepository, courseRepository → domainRepository
           ChapterRepository → TopicRepository, chapterRepository → topicRepository
类型导出：ChapterWithRelations → TopicWithRelations
```

#### 3.2 服务层

**文件重命名**

```
CourseService.ts → DomainService.ts
ChapterService.ts → TopicService.ts
```

**DomainService.ts 变更**

```
类名：CourseService → DomainService
导入：courseRepository → domainRepository
方法：getWithChaptersAndLessons → getWithTopicsAndLessons
方法：buildCoursePage → buildDomainPage
类型：CoursePage → DomainPage
映射函数：toCourse → toDomain, toChapter → toTopic
```

**TopicService.ts 变更**

```
类名：ChapterService → TopicService
导入：chapterRepository → topicRepository
方法：getChapterPage → getTopicPage
参数：courseSlug → domainSlug
类型：ChapterPage → TopicPage
返回字段：chapter → topic, course → domain
导航字段：previousChapter → previousTopic, nextChapter → nextTopic
```

**LessonService.ts 变更**

```
方法：listByChapter → listByTopic
类型字段：chapter → topic, course → domain
仓储字段：chapterEntity → topicEntity, courseEntity → domainEntity
```

**ExerciseService.ts 变更**

```
方法：listByChapter → listByTopic, listByChapterWithMeta → listByTopicWithMeta
参数：chapterSlug → topicSlug
返回字段：chapterTitle → topicTitle
导入：chapterRepository → topicRepository
```

#### 3.3 工具函数

文件：`app/content/utils.ts`

```
toCourse() → toDomain()
  - 字段映射：course/courseId 相关 → domain/domainId 相关
toChapter() → toTopic()
  - 字段映射：course/courseId → domain/domainId
toLesson()
  - 字段映射：chapter/chapterId → topic/topicId
toExercise()
  - 字段映射：chapter/chapterId → topic/topicId
```

#### 3.4 Content 入口

文件：`app/content/index.ts`

```
所有导出名更新：
  chapterService → topicService, courseService → domainService
  chapterRepository → topicRepository, courseRepository → domainRepository
类型导出：
  Course → Domain, Chapter → Topic
  ChapterListOptions → TopicListOptions
  ChapterPage → TopicPage, CoursePage → DomainPage
```

#### 3.5 Phase 1.5 验证

```bash
npx nuxi typecheck   # 零错误
```

---

### 四、Phase 2 — API 与组合式函数迁移

#### 4.1 Server API

API 统一使用复数资源路径。API 是内部接口，不需要与页面 URL 一一对应。

**目录/文件重命名**

```
server/api/course/          → server/api/domains/
  index.get.ts                index.get.ts（内容变更）
server/api/chapter/         → server/api/topics/
  index.get.ts                index.get.ts（内容变更）
  [slug].get.ts               [slug].get.ts（内容变更）
server/api/lesson/          → server/api/lessons/
  （目录名变更，文件结构保持）
server/api/exercise/        → server/api/exercises/
  （目录名变更，文件结构保持）
```

**domains/index.get.ts**

```
courseService → domainService
getCoursePage → getDomainPage
错误信息：'未找到课程' → '未找到领域'
```

**topics/index.get.ts**

```
chapterService → topicService
查询参数：course → domain
变量名：courseSlug → domainSlug
```

**topics/[slug].get.ts**

```
chapterService → topicService
getChapterPage → getTopicPage
实体名：'章节' → '主题'
```

**lessons/index.get.ts**

```
查询参数：chapter → topic
方法：listByChapter → listByTopic
```

**exercises/index.get.ts**

```
查询参数：chapter → topic
方法：listByChapterWithMeta → listByTopicWithMeta
返回字段：chapterTitle → topicTitle
```

#### 4.2 组合式函数

**文件重命名**

```
useCoursePage.ts → useDomainPage.ts
useChapterPage.ts → useTopicPage.ts
```

**useDomainPage.ts**

```
函数名：useCoursePage → useDomainPage
缓存 key：course-page:* → domain-page:*
API：/api/course → /api/domains
类型：CoursePage → DomainPage
返回字段：course → domain, chapters → topics
```

**useTopicPage.ts**

```
函数名：useChapterPage → useTopicPage
缓存 key：chapter-page:* → topic-page:*
API：/api/chapter/${slug} → /api/topics/${slug}
类型：ChapterPage → TopicPage
返回字段：chapter → topic, course → domain
         previousChapter → previousTopic, nextChapter → nextTopic
```

**useLessonPage.ts**

```
类型字段：chapter → topic, course → domain
API：/api/lesson/${slug} → /api/lessons/${slug}
默认值 key 重命名
```

#### 4.3 Phase 2 验证

```bash
npx nuxi typecheck   # 零错误
# 手动测试 API
curl http://localhost:3000/api/domains
curl http://localhost:3000/api/topics/algebra
```

---

### 五、Phase 3 — 页面与 URL 迁移

#### 5.1 页面文件重命名

Domain slug 直接作为 URL 第一级，不经过 `/domain/` 前缀。
Nuxt 静态路由（`/about`、`/study` 等）优先级高于动态路由 `[domain]`，不会冲突。

```
app/pages/course/index.vue
  → app/pages/[domain]/index.vue

app/pages/course/[chapter]/index.vue
  → app/pages/[domain]/[topic]/index.vue

app/pages/course/[chapter]/[lesson].vue
  → app/pages/[domain]/[topic]/[lesson].vue

app/pages/exercise/[chapter].vue
  → app/pages/exercise/index.vue（保持 /exercise 路径，通过查询参数 ?topic=xxx 获取数据）
```

Nuxt 文件路由映射：

```
[domain]/index.vue              → /:domain
[domain]/[topic]/index.vue      → /:domain/:topic
[domain]/[topic]/[lesson].vue   → /:domain/:topic/:lesson
exercise/index.vue              → /exercise?topic=xxx
```

Exercise 路由说明：Exercise 不是 Topic 的附属页面。未来可能扩展为单课练习、综合练习、诊断练习等多种形态。第一阶段不将 topic slug 绑定到 URL 路径，保持 `/exercise` 统一入口，通过查询参数 `?topic=xxx` 过滤内容。

路由冲突说明：当前 Domain slug 值为 `algebra`、`geometry`、`statistics`，与 `/about`、`/study`、`/methods`、`/exercise`、`/map` 等静态页面路径无冲突。Nuxt 静态路由优先级高于动态路由，即使未来新增静态页面也不会被 `[domain]` 捕获。

#### 5.2 页面内容变更

**[domain]/index.vue（原 course/index.vue）— Domain 知识领域首页**

这是知识地图展开后的领域落地页。用户从 `/map` 点击某个领域后进入此页。
展示该领域概览及其下所有 Topic 列表。

```
CSS 前缀：course-index → domain-index
         chapter-card → topic-card
组合式函数：useCoursePage → useDomainPage
数据字段：chapters → topics
链接：/course/${slug} → /${slug}
页面标题：显示 Domain 标题（如"数与代数"）
页面内容：Domain 描述 + Topic 卡片列表
中文："课程中心" → 不显示"领域"等技术术语，直接显示领域名称
```

**[domain]/[topic]/index.vue（原 course/[chapter]/index.vue）**

```
CSS 前缀：chapter-detail → topic-detail
路由参数：useRouteParam('chapter') → useRouteParam('topic')
组合式函数：useChapterPage → useTopicPage
面包屑：/course → /map
链接：/course/${chapterSlug}/${lesson} → /${domainSlug}/${lesson}
     /exercise/${chapterSlug} → /exercise?topic=${topicSlug}
用户界面：不显示"主题"标签，直接显示 Topic 标题（如"函数"）
         Lesson 列表直接列出，无需"课时"等分类标签
```

**[domain]/[topic]/[lesson].vue（原 course/[chapter]/[lesson].vue）**

```
路由参数：useRouteParam('chapter') → useRouteParam('topic')
面包屑：/course → /map
链接：/course/${chapterSlug} → /${domainSlug}
变量名：chapterSlug → topicSlug
用户界面：直接显示 Lesson 标题和内容，不显示"课时""课程"等标签
导航：页面底部保留"上一课""下一课"导航，避免成为孤岛
```

**exercise/index.vue（原 exercise/[chapter].vue）**

```
路由参数：useRouteParam('chapter') → useRoute().query.topic（查询参数）
面包屑链接：/course → /map
API 查询：?chapter= → ?topic=
变量名：chapterSlug → topicSlug, chapterTitle → topicTitle
```

#### 5.3 组件内链接更新

**Header.vue**

```
导航项：{ path: '/course', label: '课程中心' }
       → { path: '/map', label: '知识地图' }
```

**CTASection.vue**

```
NuxtLink：to="/course" → to="/map"
```

**FeatureGrid.vue**

```
文案："系统化课程" → 直接使用具体名称，如"数与代数 · 图形与几何 · 统计与概率"
     "选择课程" → "开始探索"
```

**index.vue（首页）**

```
所有 /course 链接 → /map
"核心课程" → 直接列出领域名称
"章节内容" → 不显示，改为内容描述
"选择课程" → "开始探索"
```

**study.vue**

```
Markdown 文案中避免"领域""主题"等开发术语
使用学习者能理解的语言描述内容结构
```

#### 5.4 Phase 3 验证

```bash
npx nuxi typecheck   # 零错误
npx nuxi dev         # 手动验证所有页面路由
```

#### 5.5 动态路由校验

`[domain]` 是根级动态路由，必须在 server/service 层校验 slug 合法性。
不能依赖前端判断。

**校验流程**

```
请求 /:domain/:topic/:lesson
  ↓
DomainService / TopicService 查询数据库
  ↓
domain slug 不存在 → throw createError({ statusCode: 404 })
  ↓
topic slug 不存在 → throw createError({ statusCode: 404 })
  ↓
lesson slug 不存在 → throw createError({ statusCode: 404 })
```

**实现位置**

各 API 端点的 service 调用已包含查询逻辑。查询结果为空时返回 404。
页面组合式函数收到 404 后展示错误页面。

**非法路径示例**

```
/abc/function/test        → 404（abc 不是有效 domain）
/algebra/xyz/linear       → 404（xyz 不是 algebra 下的 topic）
/algebra/function/nope    → 404（nope 不是有效 lesson）
```

---

### 六、知识地图页面设计

URL：`/map`。替代原 `/course` 页面，作为知识体系的浏览入口。

#### 6.1 交互设计

```
第一层：显示 Domain 列表（卡片或节点）
  ├── 数与代数
  ├── 图形与几何
  └── 统计与概率

第二层：点击 Domain，展开 Topic 列表
  └── 数与代数
      ├── 函数
      ├── 方程
      └── 整式

第三层：点击 Topic，进入 Topic 页面
```

#### 6.2 实现方式

新建 `app/pages/map/index.vue`。

数据获取：调用 `/api/domains` 获取 Domain 列表，每个 Domain 包含 topics 数组。

逐级展开使用组件状态控制，不需要路由跳转。

#### 6.3 与首页的关系

首页根据学习状态决定展示内容（见指导方案第六节）。知识地图作为"无学习记录"状态下的主要入口。

---

### 七、首页学习状态感知

#### 7.1 当前状态

首页 `app/pages/index.vue` 是静态着陆页，不感知学习状态。

#### 7.2 目标状态

```
进入首页
  ↓
检查 LearningState（未来由 Progress Engine 提供）
  ↓
有记录 → 继续学习入口（当前 Topic、最近 Lesson、推荐）
无记录 → 引导入口（开始学习、浏览知识地图）
```

#### 7.3 当前迭代

本阶段不实现学习状态感知，也不创建占位接口。

原因：当前没有 Progress 表、没有学习事件数据。创建假接口（`hasProgress: false`）没有实际意义，反而增加维护负担。

首页保持静态着陆页状态。待 Progress Engine 建立后，再实现学习状态接口和首页动态展示。

---

### 八、未来扩展性检查

#### 8.1 Progress Engine

当前架构：Content Engine 负责内容数据。学习状态（Progress）属于独立领域。

检查点：

- ✅ 内容数据与学习数据天然分离（不同模块）
- ✅ Lesson 是明确的最小学习单元
- ✅ Lesson 正文中的 Markdown Heading（## ）可作为未来进度追踪粒度

无需当前改动。

#### 8.2 Diagnosis Engine

未来结构：Lesson → LessonConcept ↔ Concept（多对多）

检查点：

- ✅ Lesson 表独立存在，可后续添加 LessonConcept 关联表
- ✅ Concept 不属于 Topic（多对多关系），当前模型不阻碍

无需当前改动。

#### 8.3 Recommendation Engine

依赖 Progress + Diagnosis 数据。

检查点：

- ✅ 首页未来可接入学习状态（Progress Engine 就绪后实现）
- ✅ 知识地图支持逐级展开，可接入推荐排序

无需当前改动。

---

### 九、执行顺序与检查清单

#### Phase 1：数据模型（预计 2-3 小时）

```
□ 修改 schema.ts（表名、列名、索引、关系）
□ 创建 domains seed 数据
□ drizzle-kit push 同步数据库
□ drizzle-kit generate 生成迁移
□ 修改 models/index.ts（接口重命名和字段变更）
□ npx nuxi typecheck 验证
```

#### Phase 1.5：仓储层 + 服务层（预计 3-4 小时）

```
□ 重命名 CourseRepository → DomainRepository，更新内容
□ 重命名 ChapterRepository → TopicRepository，更新内容
□ 更新 LessonRepository、ExerciseRepository 内容
□ 更新 repositories/index.ts 导出
□ 重命名 CourseService → DomainService，更新内容
□ 重命名 ChapterService → TopicService，更新内容
□ 更新 LessonService、ExerciseService 内容
□ 更新 utils.ts 映射函数（toDomain, toTopic, toLesson, toExercise）
□ 更新 content/index.ts 导出
□ npx nuxi typecheck 验证
```

#### Phase 2：API + 组合式函数（预计 2 小时）

```
□ 重命名 server/api/course/ → server/api/domains/，更新内容
□ 重命名 server/api/chapter/ → server/api/topics/，更新内容
□ 重命名 server/api/lesson/ → server/api/lessons/
□ 重命名 server/api/exercise/ → server/api/exercises/
□ 更新 useCoursePage → useDomainPage，API 路径改为 /api/domains
□ 更新 useChapterPage → useTopicPage，API 路径改为 /api/topics
□ 更新 useLessonPage.ts，API 路径改为 /api/lessons
□ npx nuxi typecheck 验证
```

#### Phase 3：页面 + 组件（预计 3-4 小时）

```
□ 重命名 pages/course/ → pages/[domain]/，更新内容（URL 无前缀）
□ 重命名 exercise/[chapter].vue → exercise/index.vue，改用查询参数 ?topic=xxx
□ 新建 pages/map/index.vue（知识地图入口）
□ 更新 Header.vue、CTASection.vue、FeatureGrid.vue 链接和文案
□ 更新 index.vue（首页）链接和文案
□ 更新 study.vue 文案
□ npx nuxi typecheck 验证
□ npx nuxi dev 手动验证所有路由（含 /:domain/:topic/:lesson）
```

#### Phase 4：文档更新（预计 1 小时）

```
□ 更新 ARCHITECTURE.md
□ 更新 ARCHITECTURE_AUDIT.md
□ 更新 PAGE_ARCHITECTURE.md
□ 更新 UI.md
□ 更新 README.md
□ 更新 CODE_QUALITY_AUDIT.md（如需要）
```

---

### 十、迁移后数据结构示例

#### 数据层级

```
Domain                Topic               Lesson
─────────────────     ──────────────      ──────────────────
algebra               function            linear-function
  数与代数               函数                一次函数

                      equation            quadratic-equation
                        方程                一元二次方程

                      expression          polynomial
                        整式                多项式

geometry              triangle            isosceles-triangle
  图形与几何              三角形               等腰三角形

                      circle              circle-area
                        圆                  圆的面积

statistics            probability         classical-probability
  统计与概率              概率                 古典概型
```

#### URL 与页面映射

```
URL                                     页面文件                          页面内容
─────────────────────────────────────   ──────────────────────────────    ──────────────────
/map                                    pages/map/index.vue               知识地图（全部领域）
/algebra                                pages/[domain]/index.vue          数与代数（领域首页）
/algebra/function                       pages/[domain]/[topic]/index.vue  函数（Topic 列表页）
/algebra/function/linear-function       pages/[domain]/[topic]/[lesson]   一次函数（Lesson 正文）
/exercise?topic=linear-function         pages/exercise/index.vue          一次函数练习
```

#### API 对应关系

```
API 端点                         用途
──────────────────────────────   ──────────────────────────────
GET /api/domains                 获取全部 Domain 列表（含 topics）
GET /api/domains/algebra         获取单个 Domain 详情
GET /api/topics?domain=algebra   获取某 Domain 下的 Topic 列表
GET /api/topics/function         获取单个 Topic 详情（含 lessons）
GET /api/lessons?topic=function  获取某 Topic 下的 Lesson 列表
GET /api/lessons/linear-function 获取单个 Lesson 详情
GET /api/exercises?topic=linear-function  获取某 Topic 的练习题
```

#### 导航流程

```
/map（知识地图）
  │
  ├─ 点击"数与代数"
  │   ↓
  │ /algebra（领域首页）
  │   │
  │   ├─ 点击"函数"
  │   │   ↓
  │   │ /algebra/function（Topic 列表页）
  │   │   │
  │   │   ├─ 点击"一次函数"
  │   │   │   ↓
  │   │   │ /algebra/function/linear-function（Lesson 正文）
  │   │   │   ├─ 上一课：无
  │   │   │   └─ 下一课：一元二次方程
  │   │   │
  │   │   └─ 点击"做练习"
  │   │       ↓
  │   │       /exercise?topic=linear-function
  │   │
  │   └─ 点击"方程"
  │       ↓
  │       /algebra/equation
  │
  └─ 点击"图形与几何"
      ↓
      /geometry
```

---

### 十一、验收标准

#### 数据层

```
✅ 不存在 Course 作为核心实体（已更名为 Domain）
✅ Domain → Topic → Lesson 关系清晰
✅ Lesson 使用 topicId（数据库内部）
✅ URL 使用 slug（外部展示）
✅ Exercise 关联到 Topic（不再关联到 Chapter）
```

#### 产品层

```
✅ 首页不是课程目录
✅ /map 知识地图逐级展开
✅ /:domain 是领域首页（展示 Topic 列表）
✅ Lesson 页面有上一课/下一课导航
✅ Exercise 通过查询参数访问，不绑定 Topic URL
✅ 用户界面不暴露 Domain/Topic/Chapter 等技术术语
```

#### 架构层

```
✅ Content Engine 不负责学习状态
✅ 内容数据和学习数据分离
✅ 可独立增加 Progress Engine
✅ 可独立增加 Diagnosis Engine
✅ 可独立增加 Recommendation Engine
✅ Lesson 段落结构通过 Markdown Heading 表达，无需数据模型
```

#### 技术层

```
✅ npx nuxi typecheck 零错误
✅ 所有页面路由可访问
✅ API 端点返回正确数据
✅ 非法路由返回 404（/abc/xyz/test → 404）
✅ 代码中无残留 course/chapter 引用（grep 验证，排除历史文档）
```

**语义残留检查命令**

```bash
# 在 app/ 和 server/ 目录下搜索残留引用
grep -r "Course\|course" app/ server/ --include="*.ts" --include="*.vue"
grep -r "Chapter\|chapter" app/ server/ --include="*.ts" --include="*.vue"
grep -r "courseService\|chapterService\|courseRepository\|chapterRepository" app/ server/
```

以上命令应返回空结果（或仅剩注释中的历史说明）。

---

### 十二、风险与注意事项

1. **数据库迁移**：如果已有生产数据，不能使用 `drizzle-kit push`（会丢数据）。必须编写 `ALTER TABLE RENAME` 手动迁移。

2. **动态路由冲突**：`[domain]` 放在根级作为动态路由。Nuxt 静态路由优先级高于动态路由，`/about`、`/study` 等已有页面不受影响。但未来新增静态页面时需注意命名不要与 Domain slug 冲突。

3. **用户界面术语**：Domain、Topic、Lesson 是开发概念。用户界面中不显示"领域""主题""课时"等标签，直接展示内容名称（如"函数""一次函数"）。代码内部保持 Domain/Topic/Lesson 命名不变。

4. **CSS 类名**：批量替换 `course-` → `domain-`、`chapter-` → `topic-` 时，确保 `<style scoped>` 和 `<template>` 同步更新。

5. **缓存 key**：组合式函数的缓存 key 从 `course-page:*` 改为 `domain-page:*`，旧缓存自动失效。
