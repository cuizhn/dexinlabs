# 得心实验室 · 项目架构原则（Architecture V2）

> Last Updated: 2026-07-22
> Version: Architecture V2
> Status: 生效中 — 所有开发遵循本文件

---

# 一、架构思想升级说明 — 项目哲学

本次不是目录调整，而是 **架构思想升级**。

**核心转变**：从"自主实现一切"转向"长期稳定维护"。

> 得心实验室不是一个追求"自主实现一切"的项目，而是一个追求"长期稳定维护"的项目。
> 所有架构决策，以降低维护成本、提高可理解性、快速定位问题为最高优先级。

---

## 1.1 背景（Context）

得心实验室教育平台在发展初期，曾尝试"自主实现一切"的技术路线：

- 自行实现 Markdown Parser / Lexer / AST
- 自行封装多层 ORM 抽象
- 自行构建复杂的中间层（Mapper / Entity / DTO 转换）
- 自行实现各种基础设施能力

随着项目演进，这种路线带来了以下问题：

1. **维护成本高** — 自行实现的 Parser、Lexer 需要持续跟进 Markdown 规范变化
2. **问题定位难** — 多层抽象导致问题链路长，难以快速定位根因
3. **新人上手慢** — 大量自研概念和架构，学习曲线陡峭
4. **生态脱节** — 无法直接复用成熟的社区插件和工具
5. **业务产出低** — 大量精力消耗在基础设施，而非教育业务本身

实践证明：对于一个教育平台而言，核心价值在于**教育内容和学习体验**，而非底层技术实现。

---

## 1.2 决策（Decision）

确立项目核心哲学：

### 决策 1：成熟方案优先

凡是已有成熟开源方案的能力，优先采用社区方案，不重复造轮子。

| 能力 | 采用方案 | 理由 |
|------|----------|------|
| Markdown 解析 | remark + unified 生态 | 社区最活跃、插件最丰富的 Markdown 生态 |
| 数学公式 | KaTeX | 渲染速度快、社区成熟 |
| 数据库 ORM | Drizzle ORM | 类型安全、性能优异、社区活跃 |
| 数据库 | PostgreSQL (Neon) | Serverless、运维成本低 |

### 决策 2：只实现业务

项目维护的代码，只负责真正的教育业务逻辑：

- 课程内容组织
- 学习流程设计
- 练习系统
- 学习记录
- 权限控制

基础设施全部交给成熟生态。

### 决策 3：Engine 是协调者

Engine 的定位是**能力协调者（Coordinator）**，不是重复实现者：

- ✅ 负责：配置、组合、协调、统一 API
- ❌ 不负责：重新实现 Parser / Lexer / ORM / Storage

### 决策 4：避免无意义抽象

不为了"架构好看"而增加层次。

判断标准：如果某一层只是 `A → B` 的参数透传，没有增加任何业务价值，应删除。

反模式：
- Repository → Mapper → Entity → DTO → Service（层层转发）
- 为了"遵循某某模式"而增加的空壳层

---

## 1.3 后果（Consequences）

### 正面后果

1. **维护成本降低** — 依托成熟社区，自行维护的代码量大幅减少
2. **问题定位更快** — 高内聚低耦合，问题可快速定位到唯一模块
3. **新人上手更快** — 标准技术栈，社区文档丰富
4. **业务产出更高** — 团队精力集中在教育业务本身
5. **生态兼容性好** — 可直接复用 remark 插件、Drizzle 工具链等

### 负面后果

1. **依赖外部生态** — 需要关注上游依赖的版本迭代和 breaking change
2. **定制化受限** — 深度定制可能需要 fork 或编写插件
3. **选型风险** — 若上游项目停止维护，需要寻找替代方案

### 缓解措施

1. 选择**社区活跃、使用广泛**的成熟方案，降低选型风险
2. 通过 Engine 层封装，**对外保持稳定 API**，内部实现可替换
3. 关注上游**版本发布和变更日志**，预留升级缓冲期

---

## 1.4 判断准则（Decision Criteria）

今后新增任何代码前，请依次判断：

### 问题 1：是否已有成熟方案？

- 如果有 → 优先用成熟方案
- 如果没有 → 继续判断

### 问题 2：是否只是重复封装？

- 如果只是给成熟方案套一层壳，没有增加业务价值 → 不要加
- 如果确实增加了业务逻辑（如统一配置、组合能力） → 可以加

### 问题 3：是否真正属于得心实验室业务？

- 如果是教育业务相关（课程、学习、练习等） → 自己实现
- 如果是通用基础设施（解析、存储、渲染等） → 用成熟方案

### 问题 4：是否增加了维护成本？

- 如果增加了大量需要长期维护的代码 → 重新考虑
- 如果只是薄封装，维护成本低 → 可以接受

### 问题 5：出现问题时，能否快速定位到唯一模块？

- 如果职责清晰，问题可定位 → 合格
- 如果职责交叉，问题链路长 → 重新设计

---

## 1.5 一句话总结

> **业务自己实现。**
> **基础能力交给成熟生态。**
> **Engine 负责组织，而不是重复实现。**

---

# 二、最高原则

## 原则 1：成熟方案优先

优先采用成熟生态，而不是重复实现。

| 能力 | 成熟方案 | 说明 |
|------|----------|------|
| Markdown 解析 | remark + unified | 不自己写 Parser/Lexer |
| Markdown 插件 | remark ecosystem | remark-gfm、remark-math 等 |
| 数据库 | PostgreSQL (Neon) | Serverless  PostgreSQL |
| ORM | Drizzle ORM | 保持原生能力，不重复封装 |
| 数学公式 | KaTeX | 通过 rehype-katex 集成 |
| 服务端 | Nuxt / H3 | 复用框架能力 |

Engine 不负责重新实现这些能力。

---

## 原则 2：只实现业务

项目自己维护的代码，只负责真正的业务逻辑：

- 教育业务
- 内容组织
- 课程模型
- 学习流程
- 权限控制
- 学习记录
- 练习系统

基础设施全部交给成熟方案。

---

## 原则 3：Engine 是协调者

Engine 是 **能力协调者（Coordinator）**，不是重复实现者。

Engine 不重新实现：
- Parser
- Lexer
- ORM
- Storage

Engine 负责：
- Processor 创建
- Plugin 管理
- 配置统一
- 对外统一 API

---

## 原则 4：避免无意义抽象

不要为了分层而分层。

如果某一层只是：

```
A → B
```

没有增加任何业务价值，应删除。

反模式示例：
- Repository → Mapper → Entity → DTO → Service（层层转发，无业务价值）
- API → Service → Repository → ORM（每层只做参数透传）

---

## 原则 5：高内聚

所有同一种能力放到同一个目录。

| 能力 | 目录 |
|------|------|
| Markdown | `app/markdown/` |
| 内容组织 | `app/content/` |
| 数据库 | `app/database/` |

这样出现问题时，可以立即定位到唯一模块。

---

## 原则 6：低耦合

上层不知道下层的实现细节。

Page 不知道：
- Markdown 如何解析
- 数据库如何查询
- Storage 如何工作

只调用公开 API。

---

## 原则 7：业务优先

业务需求决定技术方案。

不是为了使用某项技术，而增加架构复杂度。

---

## 原则 8：唯一职责归属

每一种能力，在整个项目中只能有一个真正负责它的模块。

| 能力 | 负责模块 |
|------|----------|
| Markdown | `app/markdown/` |
| 内容 | `app/content/` |
| 数据库 | `app/database/` |
| 对象存储 | `storage`（如需要） |

页面、组件、Query、API 不允许重复承担这些职责。

禁止多个模块共同维护同一种能力。

所有能力必须拥有唯一归属。

---

# 三、模块职责边界

## 1. Markdown Engine

**目标**：由"Markdown 实现者"调整为"Markdown 能力协调者"。

### 技术栈

使用 **remark + unified** 生态。

优先使用成熟插件：
- `remark-parse` — Markdown 解析
- `remark-gfm` — GitHub Flavored Markdown
- `remark-math` — 数学公式支持
- `remark-directive` — 通用指令（如需要）
- `rehype-katex` — KaTeX 数学渲染
- `rehype-stringify` — HTML 输出（或 Vue 对应 Renderer）

### 负责

- remark Processor 创建与配置
- Plugin 注册与管理
- Markdown 配置统一
- Renderer 配置（HTML / VNode / JSON）
- 对外统一 API（`render()`、`parse()` 等）

### 不负责

- Parser 实现
- Lexer 实现
- Markdown AST 定义
- Markdown 规范实现

### 目录约定

所有 Markdown 相关代码必须集中在 `app/markdown/`。

---

## 2. Content 模块

**当前定位**：Service 层直接承担内容组合职责，API 调用 Service 获取数据。

### 当前架构

API Handler 直接调用对应的 Service（如 `topicService.getTopicPage()`、`lessonService.getLessonPage()`），Service 负责数据组合并返回。不经过额外的门面层。

### 未来扩展（Content Engine）

当需要多数据源切换（FileSource / DatabaseSource）、统一缓存策略或更复杂的内容编排时，引入 Content Engine 作为统一协调层：

```
API → Content Engine（数据源选择 + 缓存） → Service → Repository
```

在单数据源阶段，Content Engine 不增加业务价值，暂不实现。

### 负责

- 获取知识领域（getDomain / listDomains）
- 获取知识主题（getTopic / listTopics）
- 获取课时（getLesson / listLessons）
- 获取练习（getExercise / listExercises）
- 数据组合（Page DTO：上一篇/下一篇、导航等）

### 不负责

- Markdown 渲染
- Vue 组件
- ORM 实现
- HTML 生成

### Repository

保持轻量，只负责数据库 CRUD。

不增加：
- DTO 转换
- Entity 映射
- Mapper 层

### Service

只保留真正的业务逻辑：
- 上一篇/下一篇
- 导航结构
- 权限判断
- 学习进度
- 内容组合

### 对外 API

Service 对外提供内容数据，API Handler 调用 Service 获取。

---

## 3. Database

### 技术栈

Drizzle ORM + PostgreSQL (Neon Serverless)

### 负责

- Schema 定义
- Migration 管理
- Repository（CRUD 封装）
- 连接管理

### 不负责

- 业务规则
- DTO / Entity / Mapper 等无业务价值的层

### 原则

- 保持 Drizzle 原生能力，不重复封装 ORM
- Schema、Migration、Repository 职责清晰
- Repository 只做数据访问，不包含业务逻辑

---

## 4. API Layer

**要求**：保持极薄。

### 流程

```
Request
   ↓
API Handler（参数校验 + 错误处理）
   ↓
Service（业务逻辑）
   ↓
Response
```

### 负责

- 参数校验（必填项、格式）
- 调用 Service
- 错误处理（400 / 404 / 503）
- 返回响应

### 不负责

- 业务逻辑
- 数据组合
- 数据库查询

---

## 5. Query / Composable Layer

**定位**：前端数据获取层。

### 流程

```
Page
  ↓
useDomainPage() / useTopicPage() / useLessonPage()
  ↓
API
```

### 负责

- 调用 API
- 数据缓存（useAsyncData）
- 加载状态
- 错误状态

### 不负责

- 业务逻辑
- 数据组合
- Markdown 解析

---

## 6. Page Layer

**定位**：纯展示层。

### 负责

- 获取数据（调用 Composable）
- 调用组件
- 页面布局与展示

### 禁止

- Markdown 解析
- SQL 查询
- 直接调用 Repository
- 业务组合逻辑

---

# 四、分层架构总览

```
┌─────────────────────────────────┐
│         Page (Vue/Nuxt)         │  展示层：仅负责展示
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     Composable (use*Page)       │  数据获取层：API 调用 + 缓存
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│         API Routes              │  接口层：参数校验 + 错误处理
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│       Service（业务逻辑）        │  上一篇/下一篇、导航、组合
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     Repository（数据访问）       │  仅 CRUD，无业务
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│    Database (Drizzle ORM)       │  基础设施层：Schema + Migration
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    Markdown Engine              │  独立能力层：remark + unified
│  （零 Content 模块依赖）         │
└─────────────────────────────────┘

未来扩展：当需要多数据源或统一缓存时，在 API 与 Service 之间引入 Content Engine 协调层。
```

---

# 五、数据流示例

## 获取课时页面数据

```
1. 页面访问 /[domain]/[topic]/[lesson]
   ↓
2. useLessonPage(slug) 调用
   ↓
3. /api/lessons/[slug] 被请求
   ↓
4. API Handler：
   - 校验 slug 参数
   - 调用 lessonService.getLessonPage(slug)
   ↓
5. LessonService：
   - 调用 lessonRepository.getBySlug(slug)
   - 调用 topicRepository.getBySlug(topicSlug)
   - 计算 previousLesson / nextLesson
   - 将 body/intro/summaryText 渲染为 HTML
   - 组合 LessonPage 返回
   ↓
6. API 返回 JSON
   ↓
7. useLessonPage 接收数据，页面渲染
```

---

# 六、开发原则

优先级从高到低：

1. **成熟生态优先** — 能用社区成熟方案就用
2. **少量封装** — 只在必要时做薄封装
3. **必要时自己实现** — 只有真正的业务逻辑才自己写

**绝不为了展示架构而增加复杂度。**

---

# 七、一句话原则

> **业务自己实现。**
> **基础能力交给成熟生态。**
> **Service 负责业务逻辑，未来由 Content Engine 统一协调。**
