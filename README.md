# 得心实验室 · 教育平台

K12 数学思维学习平台。理解为先，应用为本。让学习真正得心应手。

## 技术栈

- **框架**：Nuxt 4（SSR，Vue 3）
- **语言**：TypeScript 6
- **数据库**：PostgreSQL（Neon Serverless）
- **ORM**：Drizzle ORM
- **Markdown**：remark + unified 生态
- **数学渲染**：KaTeX
- **运行时**：Node.js >= 22

## 快速开始

```bash
# 安装依赖
npm install

# 生成 Nuxt 类型和 ESLint 配置
npx nuxt prepare

# 启动开发服务器
npm run dev
```

### 数据库

项目使用 Neon Serverless PostgreSQL。在 `.env` 中配置 `DATABASE_URL`：

```
DATABASE_URL=postgresql://...
```

```bash
# 推送 Schema 到数据库
npm run drizzle:push

# 生成 Migration
npm run drizzle:generate

# 执行 Migration
npm run drizzle:migrate
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run lint` | ESLint 检查 |
| `npm run lint:fix` | 自动修复 ESLint 问题 |
| `npm run format` | Prettier 格式化 |
| `npm run format:check` | 检查格式是否符合规范 |

## 项目结构

```
dexinlabs/
├── app/
│   ├── assets/css/       # 样式文件（CSS 变量、全局样式）
│   ├── components/       # Vue 组件（Header、Footer、Content Renderer 等）
│   ├── composables/      # 数据获取层（useDomainPage、useTopicPage、useLessonPage）
│   ├── content/          # 内容模块（Domain → Topic → Lesson）
│   │   ├── models/       # 数据模型定义
│   │   ├── repositories/ # 数据访问层（BaseRepository + 各实体 Repository）
│   │   └── services/     # 业务逻辑层（页面数据组装、导航计算）
│   ├── database/         # 数据库（Schema + 连接 + Seed）
│   ├── markdown/         # Markdown 引擎（remark + unified）
│   ├── layouts/          # 布局组件
│   └── pages/            # 页面路由
│       ├── index.vue           # 首页
│       ├── map/                # 知识地图
│       ├── [domain]/           # 领域页 + 主题页 + 课时页
│       └── exercise/           # 练习页（?topic=xxx）
├── server/
│   └── api/              # API 路由（/api/domains, /api/topics, /api/lessons, /api/exercises）
└── standards/            # 项目规范文档
```

## 架构

分层架构，职责清晰：

```
Page → Composable → API → Service → Repository → Database
```

- **Page**：纯展示，调用 Composable 获取数据
- **Composable**：数据获取 + 缓存（useAsyncData）
- **API**：参数校验 + 错误处理，调用 Service
- **Service**：业务逻辑（导航、内容组合）
- **Repository**：纯 CRUD，使用 Drizzle ORM 原生能力
- **Markdown Engine**：独立模块，零 Content 模块依赖

详见 [Architecture V2](standards/Architecture/ARCHITECTURE.md) 和 [架构审计](standards/Architecture/ARCHITECTURE_AUDIT.md)。

## 规范文档

| 文档 | 说明 |
|------|------|
| [项目愿景](standards/PROJECT_VISION.md) | 项目初心与设计理念 |
| [长期技术原则](standards/Technical_Principles.md) | 十项长期技术原则 |
| [架构原则 V2](standards/Architecture/ARCHITECTURE.md) | 分层架构与模块职责 |
| [架构审计](standards/Architecture/ARCHITECTURE_AUDIT.md) | 调用链审计与合规检查 |
| [页面架构设计 V2](standards/PAGE_ARCHITECTURE.md) | 页面路由、信息架构与交互设计 |
| [V2 迁移计划](standards/V2_MIGRATION_PLAN.md) | Domain → Topic → Lesson 迁移方案 |
| [课程设计规范 LDS](standards/LDS.md) | 课程结构与教学设计 |
| [ADR-0001](standards/adr/ADR-0001-project-philosophy.md) | 项目哲学决策记录 |
