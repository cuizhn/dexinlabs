# Dexin Labs · 项目目录结构（Architecture V2 Stable）

> Last Updated: 2026-07-16
> Status: Architecture V2 Stable
> Version: 1.0

---

## 目录结构总览

```
dexinlabs/
├── app/                              # 应用源码
│   ├── composables/                  # Vue 组合式函数（Nuxt 官方语义）
│   ├── components/                   # Vue 组件
│   │   ├── app/                      # 应用级组件（Header、Footer）
│   │   ├── course/                   # 课程相关组件
│   │   ├── home/                     # 首页组件
│   │   └── markdown/                 # Markdown 渲染组件
│   ├── content/                      # 内容模块（原 content-engine）
│   │   ├── dto/                      # 页面级数据结构
│   │   ├── models/                   # 领域实体类型
│   │   ├── queries/                  # 查询参数规范化
│   │   ├── services/                 # 业务服务层
│   │   ├── sources/                  # 数据源接口
│   │   └── index.ts                  # Content 模块入口（Facade）
│   ├── database/                     # 数据库模块（原 core/database）
│   │   ├── migrations/               # 数据库迁移文件
│   │   ├── repositories/             # 数据访问层
│   │   ├── connection.ts             # 数据库连接配置
│   │   ├── index.ts                  # Database 模块入口
│   │   └── schema.ts                 # Drizzle Schema 定义
│   ├── layouts/                      # Nuxt 布局组件
│   ├── markdown/                     # Markdown 模块（原 markdown-engine）
│   │   ├── plugins/                  # remark/rehype 插件配置
│   │   ├── renderer/                 # 渲染器（VNode 等）
│   │   ├── index.ts                  # Markdown 模块入口
│   │   ├── processor.ts              # unified Processor 配置
│   │   └── types.ts                  # 类型定义
│   ├── pages/                        # Nuxt 页面路由
│   │   ├── course/                   # 课程页面
│   │   └── exercise/                 # 练习页面
│   ├── plugins/                      # Nuxt 插件
│   └── assets/                       # 静态资源（CSS、图片）
├── server/                           # 服务端 API
│   └── api/                          # Nitro API 路由
│       ├── chapter/                  # 章节 API
│       ├── course/                   # 课程 API
│       ├── exercise/                 # 练习 API
│       └── lesson/                   # 课时 API
├── content/                          # 静态内容文件（Markdown）
│   └── courses/                      # 课程内容
├── standards/                        # 架构标准文档
│   ├── Architecture/                 # 架构文档
│   └── adr/                          # 架构决策记录
├── nuxt.config.ts                    # Nuxt 配置
├── tsconfig.json                     # TypeScript 配置
├── drizzle.config.ts                 # Drizzle ORM 配置
└── package.json                      # 项目依赖
```

---

## 模块职责

### app/composables/

**职责**：Vue Composition API 组合式函数

| 文件 | 说明 |
|------|------|
| useLessonPage.ts | 课时页面数据获取 |
| useChapterPage.ts | 章节页面数据获取 |
| useCoursePage.ts | 课程页面数据获取 |
| useLesson.js | 课时数据组合式函数 |
| useChapter.js | 章节数据组合式函数 |
| useCourse.js | 课程数据组合式函数 |

**不负责**：业务规则、数据库查询、Markdown 解析

---

### app/components/

**职责**：Vue 组件，负责展示和交互

| 目录 | 说明 |
|------|------|
| app/ | Header、Footer 等应用级组件 |
| course/ | 课程相关组件（ChapterNav、CourseCard） |
| home/ | 首页组件（FeatureGrid） |
| markdown/ | Markdown 渲染组件（render.vue） |

**不负责**：请求数据库、调用 Repository、实现业务规则

---

### app/content/

**职责**：内容获取、内容聚合、内容业务、缓存

| 目录 | 说明 |
|------|------|
| dto/ | 页面级数据结构（LessonPage、ChapterPage、CoursePage） |
| models/ | 领域实体类型（Course、Chapter、Lesson、Exercise） |
| queries/ | 查询参数规范化 |
| services/ | 业务服务（上一课/下一课、导航、内容聚合） |
| sources/ | 数据源接口（FileSource、DatabaseSource） |

**不负责**：Markdown 渲染、Vue 组件、ORM 实现、HTML 生成

---

### app/database/

**职责**：Drizzle、Schema、Repository、Migration

| 文件/目录 | 说明 |
|-----------|------|
| migrations/ | 数据库迁移文件 |
| repositories/ | 只读数据访问层 |
| connection.ts | 数据库连接配置 |
| index.ts | Database 模块入口 |
| schema.ts | Drizzle Schema 定义 |

**不负责**：业务规则、DTO/Entity/Mapper 层

---

### app/markdown/

**职责**：unified Processor、remark 配置、rehype 配置、Markdown 渲染

| 文件/目录 | 说明 |
|-----------|------|
| plugins/ | remark/rehype 插件配置（builtin.ts、registry.ts） |
| renderer/ | VNode 渲染器 |
| index.ts | Markdown 模块入口（render()、compile()、parse()、run()） |
| processor.ts | unified Processor 创建与配置 |
| types.ts | 类型定义（MarkdownMetadata、RenderResult） |

**不负责**：Vue、页面、数据库

---

### app/pages/

**职责**：获取数据、调用组件、页面布局、交互

| 目录/文件 | 说明 |
|-----------|------|
| course/ | 课程页面（[chapter]/index.vue、[chapter]/[lesson].vue） |
| exercise/ | 练习页面 |
| index.vue | 首页 |
| about.vue | 关于页面 |
| methods.vue | 学习方法页面 |
| study.vue | 学习页面 |

**不负责**：解析 Markdown、查询数据库、计算导航、处理 Repository

---

### app/plugins/

**职责**：Nuxt 插件，全局初始化和注入

| 文件 | 说明 |
|------|------|
| engine.client.js | 客户端引擎初始化 |
| engine.server.js | 服务端引擎初始化 |

---

### server/api/

**职责**：参数校验、错误处理、调用 Content

| 目录 | 说明 |
|------|------|
| chapter/ | 章节 API（[slug].get.ts、index.get.ts） |
| course/ | 课程 API（index.get.ts） |
| exercise/ | 练习 API（[slug].get.ts、index.get.ts） |
| lesson/ | 课时 API（[slug].get.ts、index.get.ts） |

**不负责**：业务逻辑、数据组合、数据库查询

---

## 调用链

### 课时页面

```
Page (/course/[chapter]/[lesson].vue)
    ↓
Query (useLessonPage)
    ↓
API (/api/lesson/[slug])
    ↓
Content (getContentEngine().getLessonPage())
    ↓
Service (LessonService.getLessonPage())
    ↓
Repository (LessonRepository.getBySlug())
    ↓
Database (Drizzle ORM)
```

### 章节页面

```
Page (/course/[chapter]/index.vue)
    ↓
Query (useChapterPage)
    ↓
API (/api/chapter/[slug])
    ↓
Content (getContentEngine().getChapterPage())
    ↓
Service (ChapterService.getChapterPage())
    ↓
Repository (ChapterRepository.getBySlug())
    ↓
Database (Drizzle ORM)
```

### 课程页面

```
Page (/course/index.vue)
    ↓
Query (useCoursePage)
    ↓
API (/api/course)
    ↓
Content (getContentEngine().getDefaultCourse())
    ↓
Service (CourseService.getDefault())
    ↓
Repository (CourseRepository.getDefault())
    ↓
Database (Drizzle ORM)
```

---

## 路径别名

| 别名 | 路径 | 说明 |
|------|------|------|
| `@shared` | `app/shared` | 共享模块 |
| `@server` | `server` | 服务端代码 |
| `@markdown` | `app/markdown` | Markdown 模块 |
| `@content` | `app/content` | Content 模块 |
| `@database` | `app/database` | Database 模块 |
| `~` | `app` | 应用根目录 |
| `~~` | `.` | 项目根目录 |

---

## 架构原则

### Principle 1：成熟方案优先

优先采用成熟生态（remark + unified、Drizzle ORM、KaTeX），不重复实现。

### Principle 2：只实现业务

项目自己维护的代码只负责真正的业务逻辑（教育业务、内容组织、课程模型、学习流程）。

### Principle 3：模块是协调者

模块负责能力协调和统一 API，不重新实现基础设施。

### Principle 4：避免无意义抽象

不要为了分层而分层，每一层必须增加业务价值。

### Principle 5：高内聚

同一种能力放到同一个目录（Markdown → markdown/、内容 → content/、数据库 → database/）。

### Principle 6：低耦合

上层不知道下层的实现细节，只调用公开 API。

### Principle 7：业务优先

业务需求决定技术方案，不是为了使用某项技术而增加架构复杂度。

### Principle 8：唯一职责归属

每一种能力在整个项目中只能有一个真正负责它的模块。

---

## 后续开发原则

1. **不再因架构而重构架构**
2. **所有新增代码必须由真实业务需求驱动**
3. **优先采用成熟生态，不重复实现基础能力**
4. **每种能力只能有一个负责它的模块**
5. **保持调用链清晰：Page → Query → API → Content → Service → Repository → Database**

---

**Architecture V2 Stable — 目录结构不再修改**
