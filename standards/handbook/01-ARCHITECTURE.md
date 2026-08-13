# 得心实验室 · Project Architecture

> Version: V3
> Status: Active

---

# 1. Philosophy

得心实验室遵循以下原则：

* 成熟生态优先
* 业务优先
* 避免无意义抽象
* 高内聚、低耦合
* 每种能力只有唯一负责人
* 长期维护优先于短期优化

项目维护的是**教育业务**，而不是基础设施。

---

# 2. Design Principles

## 2.1 Mature Solutions First

优先采用成熟生态：

| 能力                            | 方案                        |
| ----------------------------- | ------------------------- |
| Web Framework                 | Nuxt                      |
| UI                            | Vue                       |
| Markdown / Content Processing | unified / remark / rehype |
| Math Rendering                | KaTeX                     |
| ORM                           | Drizzle ORM               |
| Database                      | PostgreSQL                |
| Server Runtime                | Nuxt / H3                 |

不得重复实现成熟生态已经解决的问题。

例如：

* Parser
* Lexer
* ORM
* HTTP Server
* 基础 Markdown 解析
* 数学公式渲染

---

## 2.2 Business Only

项目自身重点维护教育业务：

* Course
* Topic
* Chapter
* Lesson
* LessonAST
* Practice
* Learning Progress
* Learning Records
* User / Permission

基础能力优先交给成熟生态。

---

## 2.3 Single Responsibility

每种能力只有一个负责人。

核心职责必须有明确归属：

| 能力          | 负责人                  |
| ----------- | -------------------- |
| 页面展示        | Page / Component     |
| 前端数据获取      | Composable           |
| HTTP 接口     | API                  |
| 教育业务逻辑      | Service              |
| 数据访问        | Repository           |
| 数据库结构       | Database             |
| Lesson 内容结构 | LessonAST            |
| 内容解析 / 编译   | Content / Compiler   |
| 内容渲染        | Renderer             |
| UI 样式       | Component / Page CSS |

不得因为方便而在多个模块重复实现同一能力。

---

# 3. Architecture

项目采用分层架构：

```text
Page / Component
        ↓
    Composable
        ↓
       API
        ↓
     Service
        ↓
   Repository
        ↓
     Database
```

内容系统作为独立能力参与业务：

```text
Lesson Content
      ↓
  Content Compiler
      ↓
   LessonAST
      ↓
    Service
      ↓
   Renderer
      ↓
      UI
```

两条路径职责不同：

* **业务数据链路**负责获取和组合数据。
* **内容链路**负责将课程内容转换为结构化 LessonAST 并最终渲染。

不得将两条链路重新混合成一个大型 Content Engine。

---

# 4. Core Domain Model

课程系统的核心结构为：

```text
Course
  ↓
Topic
  ↓
Chapter
  ↓
Lesson
  ↓
LessonAST
```

## Course

课程的顶层知识组织单位。

负责课程的：

* 标识
* 标题
* 基本信息
* Topic 组织

---

## Topic

知识主题。

Topic 是课程知识分类和长期导航的重要单位。

Topic 可以参与：

* 课程组织
* 知识导航
* 个性化学习路径
* Lesson URL

Topic 不等同于 Chapter。

---

## Chapter

课程中的学习组织单元。

负责：

* Lesson 顺序
* 学习阶段组织
* 教学路线

Chapter 主要服务课程内部的学习结构。

Chapter 不负责定义知识实体本身。

---

## Lesson

最小的完整教学单元。

Lesson 负责：

* Lesson 元数据
* 所属 Topic
* 所属 Chapter
* 学习顺序
* LessonAST 内容

Lesson 是学生实际进入和学习的主要页面单位。

---

## LessonAST

LessonAST 是课程内容的**结构化内容契约**。

它描述：

* Lesson 内容结构
* 教学语义
* 可计算的内容节点
* 可渲染的内容节点

LessonAST 不是数据库层。

也不是 UI 组件集合。

它的作用是：

> 让课程内容从“纯文本”变成系统可以理解、处理和渲染的结构化内容。

LessonAST 不得依赖：

* Vue
* Page
* API
* Repository
* Database

---

# 5. Layer Responsibilities

## 5.1 Page

负责：

* 页面结构
* 页面展示
* 调用 Composable
* 页面级状态组合

禁止：

* SQL
* Repository
* 数据库访问
* 业务规则
* Markdown 编译
* 直接处理 LessonAST 的底层实现

Page 应保持轻量。

---

## 5.2 Component

负责：

* UI 结构
* UI 交互
* 局部状态
* 视觉表现

组件优先使用语义化 HTML。

组件不得：

* 直接访问 Database
* 直接访问 Repository
* 实现业务 Service
* 自己实现内容解析器

---

## 5.3 Composable

负责：

* 调用 API
* 前端数据状态
* Loading
* Error
* Cache
* 页面所需的数据组合

Composable 不负责数据库访问。

不应复制 Service 中的业务规则。

---

## 5.4 API

负责：

* HTTP 请求入口
* 参数解析
* 参数校验
* 调用 Service
* Response 格式化

API 禁止：

* 直接调用 Repository
* 编写业务规则
* 编写 SQL
* 处理数据库细节

标准路径：

```text
API
 ↓
Service
```

---

## 5.5 Service

Service 是**教育业务逻辑的主要负责人**。

负责：

* 业务规则
* 数据组合
* Course / Topic / Chapter / Lesson 关系
* 学习流程
* 导航数据
* 权限判断
* 学习状态

Service 可以组合多个 Repository。

原则上：

> Service 不直接调用另一个 Service。

如果两个 Service 之间出现大量互相调用，应重新检查职责边界。

---

## 5.6 Repository

Repository 是数据库访问边界。

负责：

* 查询
* 创建
* 更新
* 删除
* 数据库相关查询组合

Repository 禁止：

* Vue
* API
* Page
* Markdown 内容处理
* 教育业务规则

Repository 不决定：

> “学生应该学习什么”。

Repository 只负责：

> “如何从数据库取得这些数据”。

---

## 5.7 Database

Database 层负责：

* Schema
* Migration
* Connection
* ORM 配置

使用 Drizzle ORM 操作 PostgreSQL。

Database 不负责：

* 教育业务规则
* 页面逻辑
* Lesson 渲染
* 用户界面

---

# 6. Content Architecture

课程内容系统与业务数据系统保持清晰边界。

```text
Source Content
      ↓
Content Compiler
      ↓
LessonAST
      ↓
Database / Runtime
      ↓
Renderer
      ↓
HTML / Vue UI
```

## Content Compiler

负责：

* 内容解析
* AST 构建
* 内容结构验证
* LessonAST 生成

Compiler 不负责：

* 页面展示
* 数据库业务查询
* 用户权限
* 学习进度

---

## LessonAST

LessonAST 是 Compiler 与 Runtime 之间的稳定契约。

其他系统只消费 LessonAST 定义的结构，不需要知道 Compiler 的内部实现。

例如：

```text
Compiler
   ↓
LessonAST
   ↓
Service / Renderer
```

因此：

> 修改 Compiler 的内部实现，不应要求 UI 了解 Compiler。

---

## Renderer

Renderer 负责：

* LessonAST → UI
* 节点渲染
* 内容组件映射
* 内容视觉表现

Renderer 不负责：

* 数据库查询
* 用户权限
* 学习进度
* Lesson 业务规则

---

# 7. Dependency Rules

核心业务依赖方向：

```text
Page / Component
        ↓
    Composable
        ↓
       API
        ↓
     Service
        ↓
   Repository
        ↓
     Database
```

严格禁止反向依赖。

例如：

```text
Repository → Service     ❌
Repository → API         ❌
Database → Service       ❌
Component → Repository  ❌
Page → Database          ❌
API → Repository         ❌
```

---

## Content Dependency

内容系统遵循：

```text
Source
  ↓
Compiler
  ↓
LessonAST
  ↓
Renderer
```

内容模块不得依赖业务 UI。

例如：

```text
LessonAST → Vue Component     ❌
Compiler → Repository         ❌
Renderer → Database           ❌
```

如果运行时需要课程数据，应由 Service 提供，而不是让 Renderer 自己访问数据库。

---

# 8. UI Architecture

UI 使用 Vue SFC。

## Semantic HTML First

优先使用 HTML5 语义元素表达结构：

```text
header
nav
main
article
section
aside
footer
form
figure
```

不得为了 CSS 选择器而增加没有意义的 `div` 或 class。

---

## Scoped CSS

Vue 组件样式默认使用：

```vue
<style scoped>
```

`scoped` 负责组件样式隔离。

不需要为了隔离 CSS 而机械采用 BEM 命名。

---

## Class Usage

class 仅用于表达明确的：

* 组件角色
* 布局角色
* UI 状态

例如：

```text
.search
.actions
.is-open
.is-active
```

避免大量没有语义价值的 class。

---

## Responsive Design

响应式布局由 CSS Media Query 负责。

禁止为了实现普通响应式布局而使用 JavaScript 监听：

```text
window.resize
```

Vue 状态负责交互状态。

CSS 负责屏幕尺寸和布局。

---

## Global CSS

全局 CSS 仅负责：

* Reset
* 基础排版
* 全局基础元素
* Design Tokens
* 全局主题

组件和页面的具体样式放在对应的 scoped CSS 中。

详细 CSS 编码规范见：

```text
standards/handbook/03-coding-style.md
```

---

# 9. Data Flow

标准 Lesson 页面：

```text
Lesson Page
    ↓
Composable
    ↓
API
    ↓
LessonService
    ↓
LessonRepository
    ↓
Database
```

获得 Lesson 数据后：

```text
Lesson
 ↓
LessonAST
 ↓
Renderer
 ↓
Vue UI
```

因此：

> Page 不知道数据库如何存储 Lesson；Repository 不知道 Lesson 如何显示；Renderer 不知道 Lesson 从哪里取得。

每层只关心自己的职责。

---

# 10. Thin Layers

禁止为了“架构完整”而增加没有业务价值的中间层。

例如：

```text
Repository
    ↓
Mapper
    ↓
DTO
    ↓
Adapter
    ↓
Service
```

如果这些层只是参数透传，则删除。

原则：

> **每增加一层，必须有明确职责。**

---

# 11. No Premature Abstraction

不得因为未来可能需要而提前创建：

* GenericRepository
* UniversalService
* AbstractRenderer
* BasePage
* BaseComponent
* UniversalContentEngine
* 通用 Adapter

只有当真实业务已经产生稳定的重复模式时，才进行抽象。

优先：

```text
简单、直接、明确
```

而不是：

```text
复杂、通用、理论上可扩展
```

---

# 12. Architecture Evolution

只有以下情况允许修改架构：

* 新业务无法合理实现
* 模块职责发生变化
* 出现大量真实重复
* 出现实际性能瓶颈
* 技术栈发生重大升级
* 当前架构明显阻碍长期维护

不得为了：

* 更优雅
* 更抽象
* 更“企业级”
* 追求设计模式数量
* 追求目录层级完整

而重构。

架构应该被**真实业务问题**推动。

---

# 13. Architecture Review

进行架构修改前，应回答：

1. 当前架构解决不了什么真实问题？
2. 哪个模块的职责已经发生变化？
3. 新方案减少了什么复杂度？
4. 是否增加了新的依赖？
5. 是否产生了新的重复抽象？
6. 是否会让课程内容开发更加困难？
7. 是否会增加未来维护成本？

如果无法回答这些问题，不应进行架构重构。

---

# 14. One Sentence

> **业务自己实现，基础能力交给成熟生态；每种能力只有唯一负责人；依赖保持单向；结构服务于教育业务，而不是为了架构而架构。**
