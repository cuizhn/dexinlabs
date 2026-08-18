> **Update (2026-08-18): 本调查已完成，拆分方案已实施**
>
> 本文档记录的是拆分前的现状调查结果。调查结论中提出的「双仓库 + 通过 API 调用（而非直接 import schema）」方向已被采纳并实施。
>
> **实施后实际状态**：
>
> - `dexinlabs-content` 仓库已独立，含 `lessons/**/*.md`（49 个，frontmatter 仅 `title`+`order`）、`content-manifest.json`、`compiler/`（scanner + compiler）、VitePress preview
> - `tools/content-compiler/` 已从主仓删除，Compiler 逻辑已迁至 `dexinlabs-content/compiler/`
> - `dexinlabs/lessons/` 已删除（Source of Truth 已迁 content 仓库）
> - Compiler 不再直连 DB（不再 import `app/database/schema`），改为输出 `content-package.json`
> - 主仓新增 `POST /api/content-package` Publish API（事务 UPSERT），替代旧 `content:push`
> - `shared/lessonAST.ts` 留在主仓作为 AST 唯一契约；content 仓库复制一份使用，通过 `ast_version` 锁定
> - `app/content/__tests__/compiler.test.ts` 和 `lessonContent.test.ts` 已删除（职责迁至 content 仓库）
> - seed-v4.ts 保留在主仓（作为 DB 初始种子，Publish API 可覆盖）
>
> 以下为原始调查文本，仅作历史记录保留。

---

# 拆分 `dexinlabs-content` 前现状核查

## 1. 目标

为将课程内容从 `dexinlabs` 分离到独立仓库 `dexinlabs-content` 做准备。

本阶段只调查，不修改任何文件。

---

## 2. 当前实际结构

### 2.1 目录概览

```text
dexinlabs/
├── app/                          # Nuxt 应用（前端 + 服务端）
│   ├── assets/css/               # 全局样式（含 math.css, typography.css）
│   ├── components/
│   │   ├── app/                  # 应用组件（Header, Footer, GlobalSearch...）
│   │   ├── content/              # AST 渲染器
│   │   │   ├── Renderer.vue      # Block 级渲染器（分发到各 Block 组件）
│   │   │   ├── InlineRenderer.vue # Inline 级渲染器（含 KaTeX 行内公式）
│   │   │   └── blocks/           # 14 个 Block 组件
│   │   ├── home/                 # 首页组件
│   │   ├── lesson/               # 课时页组件（Assistant, Checklist, Understand）
│   │   └── ui/                   # 通用 UI 组件
│   ├── composables/              # useLessonPage, useCourseCatalog, useExercisePage...
│   ├── content/
│   │   ├── __tests__/            # compiler.test.ts, lessonContent.test.ts
│   │   ├── service/              # course.ts, topic.ts, lesson.ts, exercise.ts
│   │   ├── navigation.ts         # getSiblings 工具函数
│   │   └── view-models.ts        # 页面视图模型类型
│   ├── database/
│   │   ├── connection.ts         # 数据库连接
│   │   ├── index.ts              # 导出 schema + repository
│   │   ├── schema.ts             # Drizzle ORM 表定义（5 张表）
│   │   ├── types.ts              # 实体类型 + toXxx 转换函数
│   │   ├── migrations/           # SQL 迁移文件
│   │   ├── repository/           # BaseRepository + 5 个具体 repository
│   │   └── seeds/                # seed-v4.ts, courses.ts
│   ├── pages/
│   │   ├── courses/[topicSlug]/[lessonSlug].vue  # 课时页
│   │   ├── courses/index.vue     # 课程目录页
│   │   ├── exercise/index.vue    # 练习页
│   │   ├── index.vue             # 首页
│   │   └── about.vue, minors.vue, privacy.vue
│   └── utils/slug.ts             # slug 规范化
├── server/
│   ├── api/
│   │   ├── courses/index.get.ts
│   │   ├── topics/index.get.ts, [slug].get.ts
│   │   ├── lessons/index.get.ts, [slug].get.ts
│   │   └── exercises/index.get.ts
│   └── utils/                    # createSlugHandler, error
├── shared/
│   └── lessonAST.ts              # Lesson AST 类型定义（全项目唯一真相源）
├── tools/
│   └── content-compiler/index.ts # Pull / Compile / Push 三阶段工具
├── lessons/                      # 课程 Markdown 源文件（gitignored!）
│   ├── .vitepress/               # VitePress 配置 + 主题 + 构建产物
│   ├── index.md                  # VitePress 首页
│   ├── number-and-algebra/       # 数与代数
│   ├── geometry/                 # 图形与几何
│   ├── statistics-and-probability/ # 统计与概率
│   ├── comprehensive-practice/   # 综合与实践
│   ├── sets/basics/              # 集合（入门课程）
│   └── linear-equations/basics/  # 一元一次方程（入门课程）
├── compile/
│   └── output/                   # 编译产物 JSON（gitignored）
├── standards/                    # 架构文档 + ADR + handbook
├── scripts/                      # 截图脚本
├── drizzle.config.ts
├── nuxt.config.ts
└── package.json
```

### 2.2 课程内容实际分布

| 内容类型 | 位置 | 数量 | 格式 | Git 跟踪 |
|---------|------|------|------|---------|
| Lesson Markdown 源文件 | `lessons/{topic}/{chapter}/{slug}.md` | 49 个 | Markdown + YAML frontmatter | 否（gitignored） |
| VitePress 首页 | `lessons/index.md` | 1 个 | Markdown | 否 |
| VitePress 配置 | `lessons/.vitepress/config.ts` | 1 个 | TypeScript | 否 |
| VitePress 主题 | `lessons/.vitepress/theme/index.ts` + `custom.css` | 2 个 | TS + CSS | 否 |
| 编译产物 JSON | `compile/output/{id}.json` | 2 个 | JSON (LessonAST) | 否（gitignored） |
| 课程/章节/课时元数据 | 数据库 | 4 topics, 17 chapters, 49 lessons | SQL 行 | N/A |
| Lesson AST 定义 | `shared/lessonAST.ts` | 1 个 | TypeScript | 是 |
| Content Compiler | `tools/content-compiler/index.ts` | 1 个 | TypeScript | 是 |
| 种子数据 | `app/database/seeds/seed-v4.ts` | 1 个 | TypeScript | 是 |

关键发现：`lessons/` 整个目录被 `.gitignore` 排除（第 37 行），课程 Markdown 源文件完全不在版本控制中。

### 2.3 Topic / Chapter / Lesson 层级

实际目录结构（`topic/chapter/lesson.md`）与数据库 schema 一致：

| Topic (slug) | Chapters | Lessons |
|---|---|---|
| number-and-algebra | 5 | 15 |
| geometry | 5 | 15 |
| statistics-and-probability | 3 | 9 |
| comprehensive-practice | 4 | 8 |
| sets | 1 | 1 |
| linear-equations | 1 | 1 |

没有发现测试课程、示例课程或旧课程文件。所有 49 个 lesson 文件都是正式课程内容。

---

## 3. Lesson 数据格式

### 3.1 真实文件示例

路径：`lessons/sets/basics/why-sets.md`

```markdown
---
id: 49
slug: why-sets
title: 为什么数学需要集合？
topic: sets
chapter: basics
---

## 从一个简单的问题开始

我们每天都在不自觉地使用「集合」...

:::definition {term="集合"}
集合是由**确定的、互不相同的对象**组成的整体。
:::

$$
A = \{ 1,\ 2,\ 3,\ 4,\ 5 \}
$$

:::hint {level="info"}
判断一个对象是否属于某集合...
:::
```

### 3.2 Frontmatter 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 数据库 lessons 表主键，编译后作为 JSON 文件名 |
| `slug` | string | 课时 slug，与数据库 lessons.slug 对应 |
| `title` | string | 课时标题 |
| `topic` | string | 所属 topic slug |
| `chapter` | string | 所属 chapter slug |

### 3.3 Markdown 语法特性

| 特性 | 语法 | 说明 |
|------|------|------|
| 标准 Markdown | `#`, `**`, `*`, `` ` ``, `>`, `-`, `\|` | 通过 remark-gfm 支持 |
| GFM 表格 | `\| ... \|` | remark-gfm |
| 行内公式 | `$E=mc^2$` | remark-math → MathInline |
| 块级公式 | `$$\n...\n$$` | remark-math → FormulaBlock(display:true) |
| 自定义容器 | `:::definition`, `:::hint`, `:::example`, `:::question` | remark-directive |
| 容器属性 | `{term="集合"}`, `{level="info"}`, `{title="..."}` | directive attributes |
| 代码块 | ` ```lang ` | 标准 Markdown |
| 链接 | `[text](url)` | 标准 Markdown |

已使用 LessonAST。Markdown 不是直接渲染到 HTML，而是通过 Content Compiler 编译为 `LessonContent` AST（定义在 `shared/lessonAST.ts`），存储到数据库 JSONB 字段，再由 Vue 组件树渲染。

### 3.4 编译产物结构

编译后的 JSON（`compile/output/49.json`）结构：

```json
{
  "version": 1,
  "blocks": [
    {
      "type": "section",
      "title": [{ "type": "text", "value": "从一个简单的问题开始" }],
      "blocks": [
        { "type": "paragraph", "children": [...] },
        { "type": "quote", "children": [...] }
      ]
    },
    { "type": "formula", "latex": "A = \\{ 1,...\\}", "display": true }
  ]
}
```

注意：`## H2` 标题会被编译为 `SectionBlock`（含 title + blocks 子数组），而非扁平的 `HeadingBlock`。

---

## 4. Lesson 数据流

### 4.1 内容创作阶段（离线）

```text
1. seed-v4.ts → Database
   (创建 courses/topics/chapters/lessons 行，content 为占位 AST)

2. content:pull → Database → lessons/{topic}/{chapter}/{slug}.md
   (读取 DB 元数据，生成 Markdown skeleton，不覆盖已有文件)

3. 作者编辑 Markdown 文件

4. content:compile → lessons/*.md → compile/output/{id}.json
   (remark-parse + GFM + math + directive → MDAST → LessonAST)

5. content:push → compile/output/*.json → Database
   (UPDATE lessons SET content = {ast} WHERE id = {id})
```

### 4.2 运行时阶段（在线）

```text
Browser
  ↓ fetch
Nuxt Server API (/api/lessons/[slug]?topic=xxx)
  ↓
LessonService.getLessonPage(topicSlug, lessonSlug)
  ↓
LessonRepository.getWithTopicAndChapter()
  ↓
PostgreSQL (lessons.content JSONB)
  ↓ 返回 LessonWithRelations
LessonService 组装 LessonPage 视图模型
  ↓ JSON
useLessonPage() composable
  ↓ reactive data
[lessonSlug].vue 页面
  ↓ :blocks="lessonData.content.blocks"
ContentRenderer.vue
  ↓ componentFor(block) → 分发到 14 个 Block 组件
InlineRenderer.vue (处理 Inline[]，含 KaTeX 行内公式)
  ↓
Browser DOM
```

### 4.3 各组件职责

| 组件 | 位置 | 职责 |
|------|------|------|
| Scanner | `tools/content-compiler/index.ts` → `findMarkdownFiles()` | 递归扫描 `lessons/` 目录，收集所有 `.md` 文件（排除 `index.md`） |
| Parser | `tools/content-compiler/index.ts` → `compileMarkdown()` | 使用 unified + remark-parse + remark-gfm + remark-math + remark-directive 将 Markdown 解析为 MDAST |
| Transformer | `tools/content-compiler/index.ts` → `transformToLessonAst()` | 将 MDAST 转换为 LessonAST（H2→SectionBlock, directive→对应 Block） |
| LessonAST | `shared/lessonAST.ts` | 全项目唯一的 AST 类型定义。14 种 Block + 6 种 Inline + ExerciseContent |
| Compiler | = Parser + Transformer | 即 `compileMarkdown()` 函数 |
| Publisher | `tools/content-compiler/index.ts` → `pushCommand()` | 读取 `compile/output/*.json`，按 id 执行 `UPDATE lessons SET content = ?` |
| LessonService | `app/content/service/lesson.ts` | 组装课时页面数据（lesson + topic + chapter + 前后导航） |
| 数据库写入 | `tools/content-compiler/index.ts` → `pushCommand()` | 直接使用 drizzle-orm + pg 连接数据库 |
| 前端消费 | `app/pages/courses/[topicSlug]/[lessonSlug].vue` | 通过 `useLessonPage()` 获取数据，传给 `ContentRenderer` |

### 4.4 VitePress 预览链路（独立于生产）

```text
lessons/*.md → VitePress (vitepress dev) → Browser（本地预览）
```

VitePress 有自己的 `markdown-it-container` 配置来渲染自定义容器，与 Compiler 的 `remark-directive` 是两套独立解析逻辑。仅用于内容作者本地预览，不参与生产。

---

## 5. 当前数据库关系

### 5.1 表结构

```text
courses (id, slug, title)
  └─ (业务关联，无 FK) → topics

topics (id, slug, title, order)
  ├─ FK ← chapters.topic_id (CASCADE)
  ├─ FK ← lessons.topic_id (SET NULL)
  └─ FK ← exercises.topic_id (SET NULL)

chapters (id, title, slug, order, topic_id)
  └─ FK ← lessons.chapter_id (SET NULL)

lessons (id, slug, title, order, content[JSONB], topic_id, chapter_id)
  唯一约束: (topic_id, slug)

exercises (id, slug, title, summary, order, content[JSONB], ast_version, topic_id)
  唯一约束: slug
```

### 5.2 关键确认

| 问题 | 答案 |
|------|------|
| Lesson 内容是否已进入数据库？ | 是。`lessons.content` 字段存储 LessonAST JSONB。 |
| 数据库存储什么格式？ | LessonAST（JSONB），不是 Markdown，不是 HTML。 |
| 数据库与源码的对应字段 | frontmatter `id` → `lessons.id`；编译后以 `id` 命名 JSON 文件，push 时按 id 更新。 |
| 唯一约束 | `lessons`: `(topic_id, slug)` 组合唯一；`topics`: `slug` 单独唯一；`exercises`: `slug` 单独唯一。 |
| Course 与 Topic 的关系 | 无数据库 FK。由 Service 层组装（当前所有 topic 归入单一 course "数学"）。 |

---

## 6. VitePress / Preview 现状

| 问题 | 答案 |
|------|------|
| VitePress 是否存在？ | 是，位于 `lessons/.vitepress/` |
| 读取什么内容？ | 直接读取 `lessons/` 下的 Markdown 文件 |
| 是否可直接预览？ | 是，`npm run content:preview` 启动 VitePress dev server |
| 是否有 compile/publish 脚本？ | 是：`content:pull` / `content:compile` / `content:push` 三个脚本 |
| VitePress 是否在 Git 中？ | 否，`lessons/` 整个目录被 gitignore |
| 是否有内容相关代码依赖 Nuxt 页面？ | 否，VitePress 完全独立于 Nuxt |

VitePress 配置特点：

- `config.ts` 硬编码了完整的 sidebar 导航（4 大 topic + 入门课程，每个 topic 下的所有 chapter 和 lesson）
- 使用 `markdown-it-container` 实现自定义容器渲染（`definition`, `example`, `hint`, `question`）
- 启用了 math 支持（VitePress 内置 markdown-it-mathjax3）
- 主题：仅继承默认主题 + 一个 `custom.css`

---

## 7. 内容相关依赖

### 7.1 仅用于内容处理的依赖

| 依赖 | 用途 | 可移动到 dexinlabs-content |
|------|------|---|
| `remark-parse` | Compiler: Markdown → MDAST | 是（仅 Compiler 使用） |
| `remark-gfm` | Compiler: GFM 表格/删除线等 | 是 |
| `remark-math` | Compiler: 数学公式解析 | 是 |
| `remark-directive` | Compiler: 自定义容器解析 | 是 |
| `unified` | Compiler: unified 生态核心 | 是 |
| `@types/mdast` | Compiler: MDAST 类型定义（devDep） | 是 |
| `markdown-it-container` | VitePress: 自定义容器渲染 | 是（仅 VitePress config 使用） |
| `vitepress` | VitePress: 本地预览工具 | 是 |

### 7.2 运行时必须保留的依赖

| 依赖 | 用途 | 必须留在 dexinlabs |
|------|------|---|
| `katex` | 前端行内/块级公式渲染（InlineRenderer.vue + FormulaBlock.vue） | 是 |
| `drizzle-orm` | 数据库 ORM | 是 |
| `pg` | PostgreSQL 驱动 | 是 |
| `playwright` | 截图脚本 | 是 |

### 7.3 Compiler 对项目的 import 依赖

`tools/content-compiler/index.ts` 的 import：

```typescript
import * as schema from '../../app/database/schema'        // ← 依赖 app/database/schema.ts
import type { Block, Inline, LessonContent } from '../../shared/lessonAST'  // ← 依赖 shared/lessonAST.ts
```

这是 Compiler 与主项目之间的两个硬耦合点。

---

## 8. Git / 构建关系

### 8.1 Git 跟踪状态

| 路径 | Git 跟踪 | 说明 |
|------|---------|------|
| `lessons/` | 否 | `.gitignore` 第 37 行排除 |
| `compile/output/` | 否 | `.gitignore` 第 32 行排除 |
| `tools/content-compiler/index.ts` | 是 | 工具源码入库 |
| `shared/lessonAST.ts` | 是 | 类型定义入库 |
| `app/database/schema.ts` | 是 | 数据库 schema 入库 |
| `app/database/seeds/seed-v4.ts` | 是 | 种子数据入库 |
| `standards/` | 是 | 架构文档入库 |

### 8.2 构建依赖关系

| 问题 | 答案 |
|------|------|
| build 时是否读取课程源码？ | 否。`nuxt build` 不读取 `lessons/` 目录。 |
| deploy 时是否依赖课程源码？ | 否。部署只需数据库中有 content。 |
| 运行时是否必须拥有 lesson Markdown？ | 否。运行时只读数据库。 |
| `lessons/` 何时需要？ | 仅内容创作（编辑 Markdown）和本地预览（VitePress）时需要。 |

### 8.3 核心问题

如果把课程源码完全移出 `dexinlabs`，当前应用是否仍然可以正常 build 和运行？

可以。原因：

1. `nuxt build` 不依赖 `lessons/` 目录
2. 运行时通过 API → Service → Repository → Database 读取内容
3. `lessons/` 已被 gitignore，本来就不在版本控制中
4. 唯一受影响的是 `content:pull` / `content:compile` / `content:push` 脚本（需要调整路径）和 `content:preview`（VitePress 预览）

---

## 9. 拆分风险分析

### A. 可以直接移动到 `dexinlabs-content`

| 目录 / 文件 | 说明 |
|---|---|
| `lessons/**/*.md` | 49 个 lesson Markdown 源文件 + VitePress 首页 |
| `lessons/.vitepress/config.ts` | VitePress 配置（含硬编码 sidebar） |
| `lessons/.vitepress/theme/index.ts` | VitePress 主题入口 |
| `lessons/.vitepress/theme/custom.css` | VitePress 自定义样式 |
| `compile/` | 编译产物目录（output JSON + theme-shots） |

条件：移动后需要调整 `tools/content-compiler/index.ts` 中的 `LESSONS_DIR` 和 `OUTPUT_DIR` 路径常量。

### B. 必须留在 `dexinlabs`

| 目录 / 文件 | 原因 |
|---|---|
| `shared/lessonAST.ts` | 前端渲染器（Renderer.vue, InlineRenderer.vue）和数据库类型（types.ts）都依赖此类型定义。是全项目共享契约。 |
| `app/components/content/` | 14 个 Block 组件 + Renderer + InlineRenderer，是 Nuxt 运行时渲染的核心。 |
| `app/content/service/` | LessonService, CourseService, TopicService, ExerciseService 运行时调用。 |
| `app/content/view-models.ts` | API 响应类型定义。 |
| `app/content/navigation.ts` | 前后导航工具函数。 |
| `app/database/` | schema, repository, connection, types, migrations, seeds 全部留在主项目。 |
| `app/composables/useLessonPage.ts` 等 | 前端数据获取。 |
| `app/pages/courses/` | 课时页面。 |
| `app/assets/css/math.css` | KaTeX 渲染样式。 |
| `server/api/lessons/` 等 | API 端点。 |
| `nuxt.config.ts` 中的 `@content` alias | 运行时路径别名。 |
| `katex` 依赖 | 运行时公式渲染。 |

### C. 需要重构后才能移动

| 目录 / 文件 | 原因 | 重构方式 |
|---|---|---|
| `tools/content-compiler/index.ts` | 硬编码了 3 个路径依赖：`../../app/database/schema`、`../../shared/lessonAST`、`ROOT_DIR/lessons` 和 `ROOT_DIR/compile/output` | 拆分为：Compiler 逻辑（可移动）+ 路径配置 + schema/AST 类型引用（从主项目 npm 包或 git submodule 引入） |
| `app/content/__tests__/compiler.test.ts` | 直接 import `../../../tools/content-compiler/index.ts` 和 `../../../shared/lessonAST` | 测试需跟随 Compiler 一起移动，或改为 import 远程包。 |
| `app/database/seeds/seed-v4.ts` | 包含所有 topic/chapter/lesson 的元数据（slug, title, order）。是内容创作的基础数据。 | 种子数据可以移到 content 仓库，但需要保留对 schema 的引用。或者种子数据留在主项目（因为是数据库结构验证数据）。 |
| `lessons/.vitepress/config.ts` | sidebar 导航硬编码了所有 lesson 链接，与数据库结构重复 | 可考虑从数据库或配置文件自动生成 sidebar。 |

### D. 隐性耦合

| 耦合点 | 类型 | 严重程度 | 说明 |
|--------|------|---------|------|
| Compiler → `app/database/schema` | import 依赖 | 高 | Compiler 的 pull/push 直接操作数据库表，需要 schema 定义。 |
| Compiler → `shared/lessonAST` | 类型依赖 | 高 | Compiler 输出的 AST 必须符合主项目的类型契约。 |
| 测试 → Compiler | import 依赖 | 中 | `app/content/__tests__/compiler.test.ts` 直接 import Compiler。 |
| seed-v4.ts → schema | import 依赖 | 中 | 种子数据脚本依赖 schema 表定义。 |
| VitePress config → 手动维护的导航 | 人工同步 | 低 | sidebar 是手动维护的，与数据库内容不同步。 |
| frontmatter `id` → 数据库 `lessons.id` | 数据依赖 | 中 | Markdown 文件通过 frontmatter id 与数据库行关联。如果 id 不一致，push 会失败。 |
| frontmatter `topic`/`chapter` → 目录结构 → 数据库 slug | 路径依赖 | 低 | pull 时根据 topicSlug/chapterSlug 生成目录路径。 |

---

## 10. `dexinlabs-content` 应该承担的职责

1. 课程 Markdown 源文件仓库：所有 `lessons/**/*.md` 文件的版本控制（当前完全不在 git 中）
2. VitePress 本地预览环境：`.vitepress/` 配置、主题、预览脚本
3. 内容编译工具：`tools/content-compiler/index.ts`（Pull/Compile/Push 三阶段）
4. 编译产物管理：`compile/output/*.json`（可选入库或 CI 生成）
5. 种子/元数据管理：topic/chapter/lesson 的 slug、title、order 等结构定义（当前在 `seed-v4.ts` 中）
6. 内容测试：Compiler 单元测试
7. 内容文档：与内容创作相关的规范文档（如 LESSON_AST.md 的创作指南部分）

---

## 11. `dexinlabs` 应该承担的职责

1. Web 应用：Nuxt 前端 + 服务端 API
2. 数据库层：schema 定义、migration、repository、connection
3. AST 类型契约：`shared/lessonAST.ts`（作为 npm 包或 git submodule 被 content 仓库引用）
4. AST 渲染器：14 个 Block 组件 + InlineRenderer + Renderer
5. 内容服务层：LessonService / CourseService / TopicService / ExerciseService
6. 运行时 KaTeX 渲染：行内/块级公式的浏览器端渲染
7. 页面与路由：课时页、课程目录页、练习页等
8. 架构文档：ADR、handbook、技术规范

---

## 12. 总结

当前项目的内容与应用之间已经做到了较好的解耦：

- 运行时不依赖 Markdown 源文件（只读数据库）
- `lessons/` 已经被 gitignore（等于已经"不在"主仓库中）
- LessonAST 作为共享类型契约已经独立存在

主要的耦合点集中在 Compiler 工具上——它同时依赖主项目的 `schema.ts` 和 `lessonAST.ts`。拆分时需要决定：

1. `shared/lessonAST.ts` 是否抽取为独立 npm 包（两个仓库共同依赖）
2. Compiler 的数据库操作是否改为通过 API 调用（而非直接 import schema）
3. 种子数据（结构定义）归属哪个仓库

这些是下一步制定迁移方案时需要做出的架构决策。
