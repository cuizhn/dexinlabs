# 德鑫实验室教育平台

> 一个可长期演进的教育内容平台，支持结构化课程管理、多学科扩展、学习流程和练习系统。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Nuxt | 4.x | 前端框架，服务端渲染 |
| TypeScript | 6.x | 类型安全 |
| Drizzle ORM | 0.45.x | 数据库 ORM |
| PostgreSQL | - | 数据存储（Neon Serverless） |
| Marked | 18.x | Markdown 解析 |
| KaTeX | 0.17.x | 数学公式渲染 |

## 项目架构

系统采用分层架构，遵循单向依赖原则：

```
Application Layer
    │
    ↓
Business Modules
    │
    ↓
Domain Engines
    │
    ↓
Infrastructure
```

### 核心引擎

| 引擎 | 路径 | 职责 |
|------|------|------|
| **Content Engine** | `app/core/content-engine/` | 内容组织/查询/模型/服务 |
| **Markdown Engine** | `app/core/markdown-engine/` | Markdown 解析/转换/渲染 |
| **Database** | `app/core/database/` | Drizzle 连接/Schema/Migration |

### 架构原则

1. **单向依赖**：Application → Modules → Engines → Infrastructure
2. **Core 目录统一组织**：所有纯技术核心能力放入 `app/core/`
3. **Engine 独立**：Content Engine 和 Markdown Engine 零互相引用
4. **Repository 不泄漏 ORM**：返回 Content Model，不返回 Drizzle Query

## 快速开始

### 环境要求

- Node.js >= 24.16.0
- npm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

开发环境默认使用本地 Markdown 文件作为数据源。

### 生产构建

```bash
npm run build
```

### 数据库迁移

```bash
# 生成迁移文件
npm run drizzle:generate

# 执行迁移
npm run drizzle:migrate

# 推送 Schema 到数据库
npm run drizzle:push

# 打开数据库管理界面
npm run drizzle:studio
```

## 环境变量

```bash
# 数据库连接（生产环境必需）
DATABASE_URL=postgresql://user:password@host:port/dbname

# 内容源选择（file | database，默认 database）
CONTENT_SOURCE=file
```

## 目录结构

```
├── app/
│   ├── core/                    # 核心引擎
│   │   ├── content-engine/      # 内容引擎
│   │   │   ├── models/          # 领域实体模型
│   │   │   ├── dto/             # 数据传输对象
│   │   │   ├── queries/         # 查询参数规范化
│   │   │   ├── services/        # 业务逻辑服务
│   │   │   ├── sources/         # 数据源实现（File/Database）
│   │   │   └── index.ts         # Content Engine Facade
│   │   ├── markdown-engine/     # Markdown 引擎
│   │   └── database/            # 数据库层
│   │       ├── schema.ts        # Drizzle Schema 定义
│   │       ├── connection.ts    # 数据库连接管理
│   │       └── repositories/    # Repository 实现
│   ├── components/              # Vue 组件
│   ├── pages/                   # Nuxt 页面
│   ├── composables/             # 组合式函数
│   └── plugins/                 # 插件
├── server/
│   └── api/                     # API 端点
├── content/                     # 本地 Markdown 内容（开发环境）
├── standards/                   # 标准文档
│   ├── Architecture/            # 架构规范
│   └── ADR/                     # 架构决策记录
└── drizzle.config.ts            # Drizzle 配置
```

## API 接口

### 课程

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/course?slug=xxx` | 获取课程页面数据 |
| GET | `/api/course` | 获取默认课程 |

### 章节

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/chapter?course=xxx` | 获取章节列表 |
| GET | `/api/chapter/:slug` | 获取章节详情 |

### 课时

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/lesson?chapter=xxx` | 获取课时列表 |
| GET | `/api/lesson/:slug` | 获取课时详情 |

### 练习

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/exercise?chapter=xxx` | 获取练习列表 |
| GET | `/api/exercise/:slug` | 获取练习详情 |

## 内容源切换

系统支持两种内容源，通过环境变量 `CONTENT_SOURCE` 切换：

### FileSource（开发环境）

基于本地 Markdown 文件，目录结构：

```
content/
└── courses/
    └── {course-slug}/
        ├── course.md
        └── chapters/
            └── {chapter-slug}/
                ├── chapter.md
                └── lesson-slug.md
```

### DatabaseSource（生产环境）

基于 PostgreSQL 数据库，通过 Drizzle ORM 访问。

## 设计模式

| 模式 | 应用位置 | 作用 |
|------|----------|------|
| **策略模式** | ContentSource 接口 | 支持 FileSource/DatabaseSource 切换 |
| **外观模式** | Content Engine Facade | 统一上层调用接口 |
| **依赖注入** | Services/Repositories | 提高可测试性和灵活性 |
| **Repository 模式** | database/repositories | 数据访问封装 |
| **延迟初始化** | connection.ts | 节省资源，提高启动速度 |

## 文档

- [架构规范](standards/Architecture/ARCHITECTURE.md)
- [Content Engine 开发原则](app/core/content-engine/CONTENT_ENGINE_IMPLEMENTATION.md)
- [Markdown Engine 规范](app/core/markdown-engine/SPEC.md)
- [架构决策记录](standards/ADR/)

## License

MIT
