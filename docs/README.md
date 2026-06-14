# Edu Platform - 数学学习平台

> 用数学理解世界

Edu Platform 是一个基于 Nuxt 3 构建的现代化数学学习平台，提供系统化的数学课程、交互式练习和知识追踪功能。

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [架构设计](#架构设计)
- [核心模块](#核心模块)
- [课程体系](#课程体系)
- [页面路由](#页面路由)
- [样式系统](#样式系统)
- [内容管理](#内容管理)
- [开发指南](#开发指南)
- [部署](#部署)

---

## 项目概述

Edu Platform 是一个面向数学教育的 Web 应用，旨在为学生提供系统化、可交互的数学学习体验。平台涵盖从代数入门到概率统计的完整数学知识体系，支持 Markdown 格式的数学公式渲染和在线练习。

### 核心特性

- **系统化课程**：从代数、几何到三角函数、概率统计，完整覆盖中学数学知识体系
- **数学公式渲染**：基于 KaTeX 的高质量 LaTeX 数学公式渲染
- **交互式练习**：支持选择题、填空题等多种题型，即时判题反馈
- **响应式设计**：适配手机、平板、电脑等多端设备
- **内容驱动**：基于 Nuxt Content 的内容管理，Markdown 编写课程内容

---

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Nuxt | ^4.4.6 | 全栈 Vue 框架 |
| 前端 | Vue | ^3.5.34 | 渐进式 JavaScript 框架 |
| 路由 | Vue Router | ^5.0.7 | Vue 官方路由 |
| 内容管理 | @nuxt/content | ^3.14.0 | Nuxt 内容模块 |
| 数据库 | better-sqlite3 | ^12.10.0 | SQLite 数据库驱动 |
| 公式渲染 | KaTeX | ^0.17.0 | LaTeX 数学公式渲染引擎 |
| Markdown 插件 | remark-math | ^6.0.0 | Markdown 数学公式支持 |
| Markdown 插件 | rehype-katex | ^7.0.1 | HTML 中 KaTeX 渲染 |
| Markdown 插件 | remark-directive | ^4.0.0 | Markdown 指令扩展 |

---

## 项目结构

```
edu-platform/
├── app.vue                          # 根组件，全局 head 设置
├── nuxt.config.js                   # Nuxt 配置文件
├── content.config.ts                # Nuxt Content 集合配置
├── package.json                     # 项目依赖与脚本
│
├── pages/                           # 页面路由
│   ├── index.vue                    # 首页（Landing Page）
│   ├── courses/
│   │   ├── index.vue                # 课程列表页
│   │   └── [slug]/
│   │       ├── index.vue            # 课程详情页
│   │       └── [chapter].vue        # 章节内容页
│   ├── practice/
│   │   └── index.vue                # 练习中心
│   └── knowledge/
│       └── index.vue                # 知识图谱（规划中）
│
├── components/                      # Vue 组件
│   ├── common/
│   │   ├── AppHeader.vue            # 顶部导航组件
│   │   └── AppFooter.vue            # 页脚组件
│   ├── course/
│   │   ├── ChapterNav.vue           # 章节导航（上一章/下一章）
│   │   ├── CourseCard.vue           # 课程卡片
│   │   ├── CourseSidebar.vue        # 课程侧边栏（章节列表）
│   │   ├── MarkdownRenderer.vue     # Markdown 渲染器
│   │   └── TocSidebar.vue           # 目录侧边栏
│   └── exercise/
│       ├── QuizChoice.vue           # 选择题组件
│       └── QuizInput.vue            # 填空题组件
│
├── modules/                         # 业务逻辑模块
│   ├── course/
│   │   └── useCourse.js             # 课程数据与查询逻辑
│   └── exercise/
│       └── useExercise.js           # 练习题数据与判题逻辑
│
├── composables/                     # 组合式函数
│   └── useMath.js                   # 数学公式工具函数
│
├── layouts/                         # 布局组件
│   └── default.vue                  # 默认布局（导航 + 内容 + 页脚）
│
├── content/                         # 课程内容（Markdown）
│   └── courses/
│       ├── algebra/                 # 代数入门
│       ├── geometry/                # 平面几何
│       ├── trigonometry/            # 三角函数
│       ├── probability/             # 概率论
│       └── statistics/              # 统计学入门
│
├── server/                          # 服务端 API
│   └── api/
│       └── content/
│           └── [slug]/
│               └── [chapter].get.ts # 章节内容 API
│
├── assets/                          # 静态资源
│   └── css/
│       ├── main.css                 # 主样式入口
│       ├── variables.css            # CSS 变量定义
│       ├── reset.css                # 样式重置
│       ├── layout.css               # 布局样式
│       ├── components.css           # 通用组件样式
│       ├── markdown.css             # Markdown 内容样式
│       └── katex.css                # KaTeX 自定义样式
│
└── utils/                           # 工具函数
    └── format.js                    # 格式化工具
```

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm / pnpm / yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动，支持热重载。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 静态站点生成

```bash
npm run generate
```

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    Nuxt 4 App                        │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Pages   │  │ Layouts  │  │    Components    │  │
│  │  (路由)   │  │  (布局)   │  │    (UI 组件)     │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                 │            │
│  ┌────┴──────────────┴─────────────────┴─────────┐  │
│  │              Composables / Modules              │  │
│  │         (useCourse, useExercise, useMath)       │  │
│  └──────────────────────┬────────────────────────┘  │
│                         │                           │
│  ┌──────────────────────┴────────────────────────┐  │
│  │           @nuxt/content (SQLite)               │  │
│  │         课程内容存储与查询                      │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 数据流

1. **课程内容**：Markdown 文件存储在 `content/courses/` 目录
2. **内容解析**：Nuxt Content 自动解析 Markdown 并存储到 SQLite
3. **课程元数据**：`_course.yml` 定义课程信息，`useCourse.js` 提供查询接口
4. **章节查询**：通过 `queryCollection('chapters')` 查询章节内容
5. **页面渲染**：Vue 组件组合数据和 UI 进行渲染

---

## 核心模块

### 1. 课程模块 (`useCourse`)

**路径**: `modules/course/useCourse.js`

负责课程数据的获取、查询和导航逻辑。

#### API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getCourse(courseSlug)` | `string` | `Object\|null` | 获取单个课程数据 |
| `getAllCourses()` | - | `Array` | 获取所有课程列表（按 order 排序） |
| `getChapter(courseSlug, chapterSlug)` | `string, string` | `Object\|null` | 获取指定课程的章节 |
| `getChapterNavigation(courseSlug, chapterSlug)` | `string, string` | `{ prev, next }` | 获取章节导航（上一章/下一章） |

#### 数据结构

```javascript
{
  id: 'algebra',              // 课程唯一标识
  title: '代数入门',           // 课程标题
  description: '...',         // 课程描述
  icon: 'x',                  // 课程图标
  difficulty: 'beginner',     // 难度: beginner | intermediate | advanced
  order: 1,                   // 排序权重
  chapters: [                 // 章节列表
    { slug: '01-introduction', title: '代数基础与方程', order: 1 }
  ]
}
```

### 2. 练习模块 (`useExercise`)

**路径**: `modules/exercise/useExercise.js`

负责练习题数据管理和判题逻辑。

#### API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getExercises(courseSlug)` | `string` | `Array` | 获取指定课程的练习题 |
| `checkChoice(selectedIndex, correctIndex)` | `number, number` | `boolean` | 判断选择题答案是否正确 |
| `checkInput(userAnswer, correctAnswer)` | `string, string` | `boolean` | 判断填空题答案是否正确 |

#### 题型支持

- **选择题** (`choice`): 提供选项，用户选择后即时判题
- **填空题** (`input`): 用户输入答案，忽略大小写和首尾空格进行匹配

### 3. 数学工具模块 (`useMath`)

**路径**: `composables/useMath.js`

提供数学公式处理相关的工具方法。

#### API

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `hasMathFormula(text)` | `string` | `boolean` | 检测文本是否包含 LaTeX 数学公式 |

---

## 课程体系

### 课程列表

| 课程 ID | 课程名称 | 难度 | 图标 | 描述 |
|---------|---------|------|------|------|
| `algebra` | 代数入门 | 入门 | x | 用字母表示数，掌握方程与不等式的解法 |
| `geometry` | 平面几何 | 进阶 | ∆ | 探索点、线、面的关系，掌握几何证明方法 |
| `trigonometry` | 三角函数 | 进阶 | sin | 深入学习正弦、余弦、正切等三角函数及其应用 |
| `probability` | 概率论 | 高级 | P | 探索随机事件和概率分布，培养概率思维 |
| `statistics` | 统计学入门 | 进阶 | σ | 学习数据收集、分析和解读的基本方法 |

### 难度等级

| 等级 | 标识 | 颜色 | 说明 |
|------|------|------|------|
| 入门 | `beginner` | 绿色 | 适合初学者，基础概念讲解 |
| 进阶 | `intermediate` | 黄色 | 需要一定基础，深入知识点 |
| 高级 | `advanced` | 红色 | 较高难度，综合应用 |

### 内容格式

课程内容使用 Markdown 编写，支持：

- **行内公式**: `$x + y = z$`
- **块级公式**: `$$\frac{a}{b}$$`
- **标准 Markdown 语法**: 标题、列表、代码块、表格等
- **章节元数据**: YAML frontmatter 定义标题、排序、课程归属等

---

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | `pages/index.vue` | 首页 Landing Page，展示平台概览和课程推荐 |
| `/courses` | `pages/courses/index.vue` | 课程列表页，支持按难度筛选 |
| `/courses/:slug` | `pages/courses/[slug]/index.vue` | 课程详情页，展示课程信息和章节列表 |
| `/courses/:slug/:chapter` | `pages/courses/[slug]/[chapter].vue` | 章节内容页，三栏布局（章节导航 + 内容 + 目录） |
| `/practice` | `pages/practice/index.vue` | 练习中心，展示练习题 |
| `/knowledge` | `pages/knowledge/index.vue` | 知识图谱（规划中） |

### 章节页面布局

```
┌──────────────────────────────────────────────────────┐
│                    Breadcrumb                         │
│                    Chapter Title                      │
├────────────┬───────────────────────────┬──────────────┤
│            │                           │              │
│  Chapter   │                           │     TOC      │
│  Sidebar   │     Chapter Content       │   Sidebar    │
│  (240px)   │     (Markdown)            │   (220px)    │
│            │                           │              │
│            ├───────────────────────────┤              │
│            │     Chapter Navigation    │              │
│            │     (Prev / Next)         │              │
└────────────┴───────────────────────────┴──────────────┘
```

---

## 样式系统

### CSS 变量

所有设计令牌通过 CSS 自定义属性定义在 `assets/css/variables.css` 中。

#### 颜色系统

```css
/* 主色 */
--color-primary: #4F46E5;        /* 靛蓝 */
--color-primary-light: #EEF2FF;  /* 浅靛蓝 */
--color-primary-dark: #4338CA;   /* 深靛蓝 */
--color-secondary: #06B6D4;      /* 青色 */

/* 语义色 */
--color-success: #10B981;        /* 成功 - 绿色 */
--color-warning: #F59E0B;        /* 警告 - 琥珀色 */
--color-error: #EF4444;          /* 错误 - 红色 */

/* 文本色阶 */
--color-text-primary: #1F2937;   /* 主文本 */
--color-text-secondary: #6B7280; /* 次要文本 */
--color-text-light: #64748B;     /* 浅色文本 */
--color-text-muted: #94A3B8;     /* 弱化文本 */

/* 背景色 */
--color-bg-primary: #F8FAFC;     /* 主背景 */
--color-bg-secondary: #F9FAFB;   /* 次背景 */
--color-bg-white: #FFFFFF;       /* 白色背景 */
```

#### 字号系统

| 变量 | 值 | 用途 |
|------|-----|------|
| `--text-xs` | 0.75rem (12px) | 版权信息、标签 |
| `--text-sm` | 0.875rem (14px) | 辅助文字、链接 |
| `--text-base` | 1rem (16px) | 正文 |
| `--text-lg` | 1.125rem (18px) | 描述文字 |
| `--text-xl` | 1.25rem (20px) | 小标题 |
| `--text-2xl` | 1.5rem (24px) | 中标题 |
| `--text-3xl` | 2rem (32px) | 大标题 |
| `--text-4xl` | 2.25rem (36px) | 超大标题 |

#### 间距系统

| 变量 | 值 |
|------|-----|
| `--spacing-xs` | 0.25rem (4px) |
| `--spacing-sm` | 0.5rem (8px) |
| `--spacing-md` | 1rem (16px) |
| `--spacing-lg` | 1.5rem (24px) |
| `--spacing-xl` | 2rem (32px) |
| `--spacing-2xl` | 3rem (48px) |

#### 字体

- **正文字体**: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- **等宽字体**: JetBrains Mono（用于数学符号、代码）

### 响应式断点

| 断点 | 宽度 | 说明 |
|------|------|------|
| 移动端 | ≤ 480px | 小屏手机 |
| 平板 | ≤ 768px | 手机/平板 |
| 桌面 | ≤ 1024px | 小屏笔记本 |
| 大屏 | > 1024px | 桌面显示器 |

---

## 内容管理

### Nuxt Content 配置

**配置文件**: `content.config.ts`

定义了两种内容集合：

#### 1. courses（课程元数据）

- **类型**: `data`（不生成页面路由）
- **数据源**: `courses/**/_course.yml`
- **Schema**:

```typescript
{
  id: string,                    // 课程唯一标识
  title: string,                 // 课程标题
  description?: string,          // 课程描述
  icon?: string,                 // 课程图标
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  order: number                  // 排序权重
}
```

#### 2. chapters（章节内容）

- **类型**: `page`（生成路由）
- **数据源**: `courses/**/**/*.md`
- **Schema**:

```typescript
{
  title: string,                 // 章节标题
  order: number,                 // 排序
  course: string,                // 所属课程 ID
  chapterType?: 'lesson' | 'exercise',
  duration?: number              // 预计学习时长（分钟）
}
```

### Markdown 配置

```javascript
// nuxt.config.js
content: {
  experimental: { sqliteConnector: true },
  markdown: {
    remarkPlugins: ['remark-math'],
    rehypePlugins: [['rehype-katex', { output: 'html' }]],
  },
}
```

- 启用 SQLite 作为内容存储后端
- 使用 `remark-math` 解析 Markdown 中的数学公式语法
- 使用 `rehype-katex` 将数学公式渲染为 HTML

### 章节内容示例

```markdown
---
title: 代数基础与方程
order: 1
course: algebra
chapterType: lesson
duration: 30
---

# 代数基础与方程

代数是数学的基础分支...

## 什么是代数？

例如，用代数表达式表示"一个数的两倍加三"：

$$
2x + 3
$$

## 一元一次方程

一元一次方程的标准形式为：

$$
ax + b = 0 \quad (a \neq 0)
$$
```

---

## 开发指南

### 添加新课程

1. 在 `content/courses/` 下创建课程目录，例如 `content/courses/calculus/`

2. 创建 `_course.yml` 定义课程元数据：

```yaml
id: calculus
title: 微积分基础
description: 学习极限、导数和积分的基本概念
icon: ∫
difficulty: advanced
order: 6
```

3. 在 `modules/course/useCourse.js` 的 `coursesData` 中添加课程数据：

```javascript
calculus: {
  id: 'calculus',
  title: '微积分基础',
  description: '学习极限、导数和积分的基本概念',
  icon: '∫',
  difficulty: 'advanced',
  order: 6,
  chapters: [
    { slug: '01-limits', title: '极限的概念', order: 1 },
  ],
}
```

4. 创建章节 Markdown 文件，例如 `content/courses/calculus/01-limits.md`

### 添加新练习题

在 `modules/exercise/useExercise.js` 的 `exercises` 对象中添加：

```javascript
calculus: [
  {
    id: 1,
    type: 'choice',
    question: '函数 $f(x) = x^2$ 在 $x = 2$ 处的导数值为？',
    options: ['2', '4', '6', '8'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'input',
    question: '计算 $\lim_{x \to 0} \frac{\sin x}{x} = $？',
    correctAnswer: '1',
  },
]
```

### 添加新页面

1. 在 `pages/` 目录下创建 `.vue` 文件
2. 文件路径自动映射为路由（Nuxt 文件系统路由）
3. 使用 `useHead` 设置页面 SEO 信息

### 添加新组件

1. 在 `components/` 目录下创建 `.vue` 文件
2. Nuxt 自动全局注册组件，无需手动 import
3. 按功能分类存放到对应子目录

### 样式开发规范

- 使用 CSS 变量，不要硬编码颜色值或尺寸
- 组件样式使用 `<style scoped>`
- 遵循 BEM 命名规范（`block__element--modifier`）
- 响应式设计使用媒体查询，移动端优先

---

## 部署

### Node.js 服务器部署

```bash
npm run build
node .output/server/index.mjs
```

### 静态站点部署

```bash
npm run generate
```

生成的静态文件位于 `.output/public/` 目录，可部署到：

- Vercel
- Netlify
- GitHub Pages
- 任何静态文件托管服务

### Docker 部署（可选）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

---

## 附录

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `CourseCard.vue` |
| 组合式函数 | camelCase + use 前缀 | `useCourse.js` |
| 工具函数 | camelCase | `format.js` |
| CSS 类名 | BEM + 双下划线/双横线 | `chapter-page__sidebar` |
| 内容文件 | kebab-case | `01-introduction.md` |

### Git 分支策略

- `main`: 生产环境分支
- `develop`: 开发环境分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支
