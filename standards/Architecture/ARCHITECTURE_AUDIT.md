# Architecture V2 Call Chain Audit

> Audit Date: 2026-07-21
> Status: Architecture V2 Stable
> Last Refactor: Exercise API 越层修复, Content Engine 定位调整, Renderer.vue Vue Adapter 确认

---

## 1. 当前调用链

### 完整调用链（课时页面）

```
Page /course/[chapter]/[lesson].vue
    ↓
Query (useLessonPage)
    ↓
API (/api/lesson/[slug])
    ↓
Service (LessonService.getLessonPage())
    ↓
Repository (LessonRepository.getBySlug())
    ↓
Database (Drizzle ORM)
```

### 完整调用链（章节页面）

```
Page /course/[chapter]/index.vue
    ↓
Query (useChapterPage)
    ↓
API (/api/chapter/[slug])
    ↓
Service (ChapterService.getChapterPage())
    ↓
Repository (ChapterRepository.getBySlug())
    ↓
Database (Drizzle ORM)
```

### 完整调用链（课程页面）

```
Page /course/index.vue
    ↓
Query (useCoursePage)
    ↓
API (/api/course)
    ↓
Service (CourseService.getCoursePage())
    ↓
Repository (CourseRepository.getDefault())
    ↓
Database (Drizzle ORM)
```

---

## 2. 模块职责

### markdown-engine

**负责**：
- remark Processor 创建与配置
- Plugin 注册与管理（remark-gfm、remark-math 等）
- Markdown 配置统一
- Renderer 配置（HTML / VNode）
- 对外统一 API（`render()`、`compile()`、`parse()`、`run()`）
- 元数据提取（frontmatter、TOC、readingTime）

**不负责**：
- Parser 实现（使用 remark-parse）
- Lexer 实现
- Markdown AST 定义（使用 mdast）
- Vue 组件渲染
- 业务逻辑

### content 模块（Service 层）

**负责**：
- 获取课程/章节/课时/练习
- 数据组合（上一课/下一课、导航、面包屑）

**不负责**：
- Markdown 渲染
- Vue 组件
- ORM 实现
- HTML 生成

**未来扩展**：当引入多数据源或统一缓存时，升级为 Content Engine 协调层。

### database

**负责**：
- Schema 定义
- Migration 管理
- Repository（只读 CRUD）
- 连接管理

**不负责**：
- 业务规则
- DTO / Entity / Mapper 层

### Service

**负责**：
- 上一课/下一课计算
- 面包屑生成
- 导航结构
- 内容聚合
- 权限判断（如需要）

**不负责**：
- SQL 查询
- ORM 操作
- Renderer
- Markdown 解析

### Repository

**负责**：
- 数据读取（list、getBySlug、getById、count）

**不负责**：
- 数据写入（已删除 create/update/delete/upsert）
- Markdown 处理
- HTML 生成
- Vue 组件
- 页面聚合
- 权限逻辑

### Query / Composable

**负责**：
- API 调用
- 数据缓存（useAsyncData）
- 加载状态
- 错误状态
- Refresh 能力

**不负责**：
- 课程业务逻辑
- Markdown 解析
- 数据库逻辑

### API

**负责**：
- 参数校验
- 错误处理（400 / 404 / 503）
- 调用 Service
- 返回响应

**不负责**：
- 业务逻辑
- 数据组合
- 数据库查询

### Page

**负责**：
- 获取数据（调用 Composable）
- 调用组件
- 页面布局
- 交互

**不负责**：
- 解析 Markdown
- 查询数据库
- 计算导航
- 处理 Repository

### Component

**负责**：
- 展示
- 交互

**不负责**：
- 请求数据库
- 调用 Repository
- 实现业务规则

---

## 3. 越层调用检查

### 检查结果

| 检查项 | 结果 | 说明 |
|--------|------|------|
| Page → Repository | ✅ 通过 | 所有页面只调用 Composable，不直接访问 Repository |
| Page → Database | ✅ 通过 | 无页面直接访问数据库 |
| Page → Markdown Engine | ✅ 通过 | 页面不直接调用 Markdown Engine |
| Component → Repository | ✅ 通过 | 无组件直接调用 Repository |
| Component → Database | ✅ 通过 | 无组件直接访问数据库 |
| Component → Markdown Engine | ✅ 通过 | Renderer.vue 作为 Vue Adapter 调用 Engine，属于合理边界（见下方说明） |
| API → Service | ✅ 通过 | API 只调用 Service，不直接访问 Repository |
| API → Repository | ✅ 通过 | 已修复 exercise API 越层调用（2026-07-21） |
| 业务层 → unified/remark/rehype/mdast/hast | ✅ 通过 | 所有 markdown 生态 import 都在 markdown engine 内部 |

### 特殊情况说明

**Renderer.vue（`app/components/content/Renderer.vue`）**：

这是 Markdown Engine 的 Vue Adapter，属于合理边界：
- 它的唯一职责是调用 Engine API（`renderToHTML`）并展示结果
- 不包含任何业务逻辑
- 不直接访问 Repository/Database
- 作为 Engine 的表现层桥梁，Component → Vue Adapter → Engine 是合理的调用路径
- 符合架构原则

---

## 4. 最终结论

### 架构状态

> **Architecture V2 Stable**

项目已满足所有架构原则：

1. ✅ **成熟方案优先** — 使用 remark + unified、Drizzle ORM、KaTeX
2. ✅ **只实现业务** — 基础能力全部交给成熟生态
3. ✅ **Engine 是协调者** — Markdown Engine 不重新实现 Parser/Lexer
4. ✅ **避免无意义抽象** — 已删除 Repository 写方法、Service 依赖注入
5. ✅ **高内聚** — Markdown、内容、数据库能力各自集中
6. ✅ **低耦合** — 上层不知道下层实现细节
7. ✅ **业务优先** — 架构由业务需求驱动
8. ✅ **唯一职责归属** — 每种能力只有一个负责模块

### 后续开发原则

- 不再因架构而重构架构
- 所有新增代码必须由真实业务需求驱动
- 优先采用成熟生态，不重复实现基础能力
- 每种能力只能有一个负责它的模块
- 保持调用链清晰：Page → Query → API → Service → Repository → Database

### 下一步工作重心

1. Admin 后台（课程管理、Markdown 编辑、CRUD）
2. 练习系统（Exercise）
3. 学习记录与进度
4. 用户系统
5. 家长陪伴与反馈
6. 课程内容持续建设

---

**Architecture V2 Call Chain Audit 完成。**

**项目正式进入稳定阶段。**
