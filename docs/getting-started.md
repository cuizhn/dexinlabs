# 快速开始指南

> 5 分钟搭建本地开发环境并开始学习

## 前置条件

确保你的开发环境已安装以下工具：

| 工具 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 18.0.0 | 20.x LTS | JavaScript 运行时 |
| npm | 9.0.0 | 10.x | 包管理器（或使用 pnpm/yarn） |

检查版本：

```bash
node -v   # 应输出 v18.x.x 或更高
npm -v    # 应输出 9.x.x 或更高
```

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd edu-platform
```

### 2. 安装依赖

```bash
npm install
```

首次安装可能需要 1-3 分钟，取决于网络速度。

### 3. 启动开发服务器

```bash
npm run dev
```

启动成功后，终端会显示：

```
➜ Local:    http://localhost:3000/
➜ Network:  use --host to expose
```

在浏览器中打开 `http://localhost:3000/` 即可访问。

### 4. 验证安装

访问以下页面确认一切正常：

| 页面 | URL | 预期内容 |
|------|-----|---------|
| 首页 | `http://localhost:3000/` | Landing Page，展示课程统计和功能介绍 |
| 课程列表 | `http://localhost:3000/courses` | 5 门课程的卡片列表 |
| 代数课程 | `http://localhost:3000/courses/algebra` | 代数入门课程详情和章节列表 |
| 章节内容 | `http://localhost:3000/courses/algebra/01-introduction` | 带数学公式渲染的章节内容 |
| 练习中心 | `http://localhost:3000/practice` | 交互式练习题 |

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器（支持热重载）

# 构建
npm run build        # 构建生产版本
npm run generate     # 生成静态站点
npm run preview      # 预览生产构建

# 其他
nuxt dev --host      # 局域网访问
nuxt dev --port 4000 # 自定义端口
```

## 项目结构速览

```
edu-platform/
├── pages/           # 页面（自动路由）
├── components/      # Vue 组件（自动注册）
├── modules/         # 业务逻辑模块
├── content/         # Markdown 课程内容
├── composables/     # 组合式函数
├── layouts/         # 布局组件
├── server/          # 服务端 API
├── assets/css/      # 样式文件
└── nuxt.config.js   # Nuxt 配置
```

## 第一个修改：添加课程内容

### 创建新章节

在 `content/courses/algebra/` 下创建 `03-equations.md`：

```markdown
---
title: 方程组与不等式
order: 3
course: algebra
chapterType: lesson
duration: 40
---

# 方程组与不等式

## 二元一次方程组

二元一次方程组的标准形式：

$$
\begin{cases}
a_1x + b_1y = c_1 \\
a_2x + b_2y = c_2
\end{cases}
$$

## 解法：代入消元法

1. 从一个方程中解出一个未知数
2. 代入另一个方程
3. 求解剩余未知数
4. 回代求出第一个未知数

### 例题

解方程组：

$$
\begin{cases}
x + y = 5 \\
2x - y = 1
\end{cases}
$$

由第一个方程得 $y = 5 - x$，代入第二个方程：

$$
2x - (5 - x) = 1
$$

$$
3x = 6 \implies x = 2
$$

回代得 $y = 3$。

## 一元一次不等式

不等式的性质与方程类似，但注意：

> **重要**：不等式两边同时乘以或除以负数时，不等号方向要改变。
```

### 更新课程数据

编辑 `modules/course/useCourse.js`，在 `algebra` 的 `chapters` 数组中添加：

```javascript
chapters: [
  { slug: '01-introduction', title: '代数基础与方程', order: 1 },
  { slug: '02-functions', title: '函数与图像', order: 2 },
  { slug: '03-equations', title: '方程组与不等式', order: 3 },  // 新增
],
```

保存后，开发服务器会自动热重载，新章节立即可见。

## 常见问题

### Q: 启动时报错 `better-sqlite3` 编译失败

**解决方案**：确保已安装 Python 和 C++ 构建工具。

Windows：
```bash
npm install --global windows-build-tools
```

### Q: 修改内容后页面没有更新

开发服务器支持热重载，但有时需要手动刷新浏览器。如果仍然无效，尝试：

```bash
# 删除缓存并重启
rm -rf .nuxt .data
npm run dev
```

### Q: 数学公式没有正确渲染

检查以下几点：
1. 公式语法是否正确（行内用 `$...$`，块级用 `$$...$$`）
2. `nuxt.config.js` 中是否正确配置了 `remark-math` 和 `rehype-katex`
3. 浏览器控制台是否有 KaTeX 相关报错

### Q: 如何查看 Nuxt Content 的数据库内容

内容数据存储在 `.data/content/contents.sqlite`，可以使用 SQLite 浏览器查看：

```bash
# 安装 SQLite CLI
# Windows: 下载 sqlite-tools from https://www.sqlite.org/download.html

# 查看章节数据
sqlite3 .data/content/contents.sqlite "SELECT * FROM chapters;"
```

## 下一步

- 阅读 [架构设计文档](./README.md#架构设计) 了解整体架构
- 查看 [开发指南](./README.md#开发指南) 学习如何添加课程和练习
- 参考 [API 文档](./api-reference.md) 了解各模块的接口
