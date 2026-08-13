# 得心实验室 · Coding Style

> Version: V3
> Status: Active

---

# 1. 文档定位

本文档规定得心实验室项目的**代码表达规范**。

本文档不决定系统架构职责。
架构职责由 `01-architecture.md` 定义。

本文档只回答：

> **在职责已经确定的情况下，代码应该如何书写。**

目标：

* 保持代码一致性；
* 提高可读性；
* 降低多人和 AI Agent 协作成本；
* 降低长期维护成本；
* 让代码能够清晰表达业务意图。

所有新增代码和修改后的代码都应遵循本文档。

---

# 2. 基本原则

## 2.1 可读性优先

代码首先服务于阅读者。

优先：

* 清晰命名；
* 明确结构；
* 简单逻辑；
* 显式表达意图。

避免：

* 过度简写；
* 晦涩技巧；
* 不必要的抽象；
* 单行复杂表达式。

---

## 2.2 显式优于隐式

推荐：

```ts
const lessonTitle = lesson.title
```

避免：

```ts
const t = l.t
```

变量、函数和类型名称应表达真实含义。

---

## 2.3 一个函数一个职责

函数应该：

* 完成单一任务；
* 保持合理规模；
* 易于理解；
* 易于测试。

避免一个函数同时：

* 获取数据；
* 处理业务；
* 转换数据；
* 修改多个状态；
* 处理 UI。

如果一个函数承担多个明显职责，应优先拆分。

---

## 2.4 避免无意义抽象

不要为了“看起来架构完整”而增加：

* Base；
* Abstract；
* Generic；
* Universal；
* Helper；
* Adapter；

等没有实际职责的抽象。

抽象必须解决真实的重复或复杂度问题。

---

# 3. TypeScript 规范

## 3.1 类型要求

核心业务代码必须具有明确类型。

推荐：

```ts
interface Lesson {
  id: string
  title: string
  content: string
}
```

避免：

```ts
const lesson: any = {}
```

---

## 3.2 禁止滥用 `any`

`any` 只能用于：

* 第三方库类型缺失；
* 临时兼容处理；
* 无法合理建模的边界数据。

正常业务代码禁止使用 `any`。

如果使用 `any` 无法避免，应尽可能限制其作用范围。

---

## 3.3 类型命名

类型名称必须表达实际含义。

推荐：

```ts
Lesson
LessonDetail
LessonMetadata
ContentNode
RenderResult
LessonQuery
```

避免：

```ts
Data
Info
Object
Thing
Result
```

等无法表达具体含义的名称。

---

## 3.4 类型与接口

如果类型主要用于描述对象结构，可使用 `interface`。

如果需要：

* 联合类型；
* 元组；
* 条件类型；
* 映射类型；

等 TypeScript 类型表达能力，使用 `type`。

不要为了风格统一而强制所有类型使用同一种形式。

---

# 4. 命名规范

## 4.1 变量与函数

使用 `camelCase`。

```ts
const lessonTitle = '函数'

function getLessonBySlug() {}
```

函数名称应优先使用动词表达行为：

```text
getLesson()
createLesson()
updateLesson()
deleteLesson()
renderLesson()
validateLesson()
```

---

## 4.2 类型、接口和 Vue 组件

使用 `PascalCase`：

```text
Lesson
LessonMetadata
ContentNode
LessonCard
ContentRenderer
AppHeader
GlobalSearch
```

---

## 4.3 常量

真正意义上的全局或模块常量使用 `UPPER_SNAKE_CASE`：

```ts
const MAX_LESSON_COUNT = 20
```

局部变量不因为使用 `const` 就必须使用大写。

例如：

```ts
const lessonTitle = lesson.title
```

是正确的。

---

# 5. 文件与目录命名

## 5.1 TypeScript 文件

使用 `kebab-case`：

```text
lesson-service.ts
content-loader.ts
lesson-repository.ts
```

---

## 5.2 Vue 组件

使用 `PascalCase`：

```text
LessonCard.vue
ContentRenderer.vue
AppHeader.vue
GlobalSearch.vue
```

---

## 5.3 目录

目录名称应表达职责：

```text
components/
composables/
services/
repositories/
types/
utils/
```

避免：

```text
misc/
common2/
temp/
stuff/
helpers/
```

除非目录名称确实具有明确且稳定的职责。

---

# 6. Vue SFC 规范

## 6.1 基本结构

Vue 单文件组件使用：

```vue
<script setup lang="ts">

</script>

<template>

</template>

<style scoped>

</style>
```

不需要某个区块时可以省略。

---

## 6.2 Script 顺序

推荐顺序：

1. imports
2. props
3. emits
4. state
5. computed
6. functions / methods
7. watchers
8. lifecycle

例如：

```ts
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{
  lessonId: string
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

const isOpen = ref(false)

const title = computed(() => ...)

function toggle() {
  ...
}

onMounted(() => {
  ...
})
```

如果组件逻辑简单，不需要机械填满所有区块。

---

## 6.3 Props

Props 必须具有明确类型。

推荐：

```ts
const props = defineProps<{
  lessonId: string
}>()
```

避免：

```ts
defineProps(['lessonId'])
```

---

## 6.4 Emits

事件应具有明确名称和类型。

推荐：

```ts
const emit = defineEmits<{
  select: [lessonId: string]
}>()
```

事件名称应表达实际发生的行为。

---

# 7. Vue 组件职责

组件职责遵循 `01-architecture.md`。

## 7.1 展示组件

展示组件负责：

* 接收数据；
* 展示内容；
* 处理简单 UI 交互；
* 管理必要的局部 UI 状态。

例如：

```text
LessonCard.vue
GlobalSearch.vue
ContentRenderer.vue
```

展示组件禁止：

* 直接查询数据库；
* 直接访问 Repository；
* 实现 Service 业务逻辑；
* 自己实现数据访问层。

---

## 7.2 页面组件

页面负责：

* 页面结构；
* 页面级组件组合；
* 调用 Composable；
* 管理页面级 UI 状态。

例如：

```text
pages/[topicSlug]/[lessonSlug].vue
```

页面不得直接：

* 查询数据库；
* 调用 Repository；
* 实现数据库逻辑；
* 实现底层内容解析。

页面通过 Composable 获取 API 数据。

---

## 7.3 组件拆分原则

只有在存在明确职责时才拆分组件。

适合拆分的情况：

* 有独立交互；
* 有独立状态；
* 有明确复用价值；
* 内部逻辑已经影响父组件可读性。

不要为了减少模板行数而机械拆分组件。

---

# 8. HTML 语义化规范

## 8.1 Semantic HTML First

优先使用语义化 HTML 表达文档结构：

```html
<header>
<nav>
<main>
<article>
<section>
<aside>
<footer>
<form>
<figure>
```

例如 Lesson 页面：

```html
<main>
  <article>
    <header>
      <h1>为什么需要函数？</h1>
    </header>

    <section>
      ...
    </section>
  </article>

  <aside>
    ...
  </aside>
</main>
```

---

## 8.2 `div` 并非禁止

语义化 HTML 不等于禁止 `div`。

以下情况可以使用 `div`：

* Flex 布局容器；
* Grid 布局容器；
* 样式包裹元素；
* 没有独立文档语义的结构组合。

例如：

```html
<div class="actions">
  <button>上一课</button>
  <button>下一课</button>
</div>
```

这里 `div` 作为布局容器是合理的。

---

## 8.3 不使用 class 模拟 HTML 语义

避免：

```html
<div class="main">
<div class="header">
<div class="section">
```

如果元素本身具有对应语义，应直接使用：

```html
<main>
<header>
<section>
```

---

## 8.4 HTML 结构优先于 CSS

不要为了方便 CSS 而改变正确的 HTML 语义。

HTML 首先表达：

> 这是什么。

CSS 再表达：

> 它应该如何显示。

---

# 9. CSS 规范

## 9.1 Scoped CSS 默认

Vue 组件样式默认使用：

```vue
<style scoped>
```

组件内部样式不应默认写入全局 CSS。

`scoped` 已经负责组件样式隔离，因此**不需要为了避免样式污染而机械使用 BEM 命名空间**。

---

## 9.2 语义元素优先

如果 HTML 元素本身已经能够准确表达结构，可以直接使用元素选择器。

例如：

```css
header {
  ...
}

nav {
  ...
}

article {
  ...
}
```

不要为了使用 CSS 而额外添加：

```html
<header class="app-header">
```

如果这个 class 没有额外表达意义。

---

## 9.3 class 的使用原则

class 只在具有明确意义时使用。

适合表示：

* 组件角色；
* 布局角色；
* 特殊视觉对象；
* UI 状态。

例如：

```css
.search {
  ...
}

.actions {
  ...
}

.is-open {
  ...
}
```

不应为了 CSS 选择器机械增加大量 class。

---

## 9.4 不强制使用 BEM

本项目使用 Vue SFC 和 `scoped CSS`。

因此不强制采用：

```text
.app-header__container
.app-header__search-input
.app-header__user-btn
```

这种完整 BEM 命名体系。

class 应该首先表达意义，而不是表达 DOM 所属层级。

---

## 9.5 状态命名

UI 状态统一使用：

```text
.is-active
.is-open
.is-selected
.is-current
.is-disabled
```

例如：

```vue
<div :class="{ 'is-open': isSearchOpen }">
```

不要创造大量含义重复的状态名称。

---

## 9.6 避免脆弱的 DOM 路径选择器

避免：

```css
main div div span {
}
```

以及：

```css
header > div > div > button {
}
```

这种选择器依赖具体 DOM 层级，结构调整后容易失效。

如果元素具有明确角色，应使用语义元素或有意义的 class。

---

## 9.7 不滥用 `:deep()`

`:deep()` 只用于确实需要穿透子组件 scoped 边界的情况。

禁止使用：

```css
:deep(*) {
}
```

将整个子组件重新变成事实上的全局 CSS。

---

# 10. CSS 布局

## 10.1 优先正常文档流

布局优先使用：

* Normal Flow；
* Flex；
* Grid。

例如：

```css
.container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
```

---

## 10.2 谨慎使用绝对定位

`position: absolute` 适合：

* Tooltip；
* Dropdown；
* Overlay；
* 浮动按钮；
* 装饰元素；
* 确实需要脱离文档流的 UI。

不要使用大量 absolute 来模拟正常页面布局。

避免：

```css
left: 437px;
top: 182px;
```

等依赖具体屏幕位置的布局方式。

---

## 10.3 避免不必要的固定高度

优先：

```css
min-height
padding
aspect-ratio
```

而不是为内容区域设置过多固定 `height`。

内容应该能够根据实际内容自然增长。

---

# 11. Responsive CSS

响应式布局由 CSS 负责。

推荐：

```css
@media (max-width: 768px) {
  ...
}
```

禁止为了普通响应式布局而使用：

```ts
window.addEventListener('resize', ...)
```

或：

```ts
const isMobile = ref(...)
```

来重复实现 CSS Media Query。

---

## 11.1 JavaScript 只管理交互状态

例如：

```ts
const isSearchOpen = ref(false)
```

是合理的。

因为它表达的是：

> 搜索 UI 是否打开。

而：

```ts
const isMobile = ref(false)
```

如果只是为了控制 CSS 布局，则不应存在。

原则：

> **CSS 决定布局，Vue 决定交互状态。**

---

# 12. Design Tokens

颜色、间距、圆角、阴影等设计基础值优先使用项目 Design Tokens。

推荐：

```css
color: var(--color-text-primary);
padding: var(--spacing-md);
border-radius: var(--border-radius-md);
```

避免在组件中大量散落：

```css
color: #333333;
padding: 13px;
border-radius: 7px;
```

如果现有 Token 不足，应补充统一 Token，而不是每个组件创建自己的数值体系。

---

# 13. Global CSS

全局 CSS 负责：

* Reset / Normalize；
* `html` / `body` 基础设置；
* 全局字体；
* 基础排版；
* Design Tokens；
* 全局主题；
* 必要的无障碍基础规则。

组件具体视觉样式放在对应 SFC 的：

```vue
<style scoped>
```

中。

不要把组件样式随意放入全局 CSS。

---

# 14. Lesson 内容 CSS

Lesson 页面中的课程正文属于特殊内容系统。

LessonAST Renderer 负责内容结构和节点渲染。

Lesson 内容样式应由统一的内容主题控制，而不是由每个 Lesson 页面单独定义。

正文中的：

```html
<h1>
<h2>
<p>
<ul>
<ol>
<blockquote>
<figure>
<table>
```

以及 LessonAST 自定义语义节点，应具有统一的内容排版规范。

因此：

> Lesson 页面 UI CSS 与 Lesson 内容 CSS 应保持职责分离。

页面负责：

```text
布局
导航
侧栏
Header
交互
```

内容主题负责：

```text
正文排版
知识卡片
公式
例题
提示
练习
内容节点
```

---

# 15. 导入规范

Import 应保持稳定、清晰的顺序。

推荐：

```ts
// Vue
import { computed, ref } from 'vue'

// External
import { z } from 'zod'

// Internal
import { lessonService } from '@/core/lesson'
```

项目已有 ESLint / Formatter 规则时，以工具配置为最终执行标准。

不要为了个人习惯反复调整 import 顺序。

---

# 16. 注释规范

## 16.1 注释说明原因

推荐：

```ts
// 保留 HTML 输出，避免客户端重复解析 Markdown
const html = ...
```

避免：

```ts
// 设置 html
const html = value
```

---

## 16.2 优先让代码自己解释

如果代码本身已经清晰，不添加重复注释。

注释重点解释：

* 为什么这样做；
* 为什么不能使用看起来更简单的方案；
* 某个业务限制；
* 某个技术限制。

不要解释代码已经明确表达的内容。

---

# 17. 错误处理

错误必须：

* 明确；
* 可追踪；
* 在适当层级处理；
* 不静默失败。

禁止：

```ts
try {
  ...
} catch {
}
```

空 catch。

如果确实需要忽略错误，必须有明确原因，并通过注释说明。

---

# 18. AI Agent 代码要求

AI Agent 修改代码时必须：

1. 先理解现有目录结构；
2. 先阅读相关模块职责；
3. 使用项目已有抽象；
4. 优先复用已有能力；
5. 修改最少必要文件；
6. 保持现有 API 和类型契约；
7. 不因局部需求重建已有系统。

禁止：

* 为简单功能创建新层；
* 重复实现已有能力；
* 创建无意义的通用抽象；
* 修改无关文件；
* 大范围格式化；
* 为了“顺便优化”扩大任务范围；
* 未确认架构后自行重构目录。

如果现有代码与规范冲突：

> **先报告冲突，再修改。**

不得默认通过大规模重构解决。

---

# 19. 代码审查标准

代码审查至少检查以下内容。

## 结构

* 是否符合 `01-architecture.md` 的模块职责？
* 是否出现跨层依赖？
* 是否增加了没有必要的抽象？

## 类型

* 是否具有明确类型？
* 是否滥用 `any`？
* 类型名称是否表达真实含义？

## 命名

* 是否容易理解？
* 是否与项目已有命名保持一致？
* 是否存在无意义的缩写？

## Vue

* Component 是否保持单一职责？
* Props / Emits 是否具有明确类型？
* 是否错误地在组件中访问业务层？
* 是否使用 JS 重复实现 CSS 响应式？

## HTML

* 是否优先使用语义化元素？
* 是否为了布局而误用语义元素？
* 是否存在可以删除的无意义 wrapper？

## CSS

* 是否默认使用 scoped CSS？
* class 是否具有明确意义？
* 是否存在不必要的 BEM 命名？
* 是否大量依赖 DOM 层级选择器？
* 是否滥用 absolute？
* 是否使用 Design Tokens？
* 是否把组件样式错误地放入全局 CSS？

## 维护

问一个简单的问题：

> **六个月后的开发者还能快速理解这段代码为什么这样写吗？**

---

# 20. 优先级

代码质量优先级：

```text
正确性
  ↓
架构一致性
  ↓
可维护性
  ↓
可读性
  ↓
性能
  ↓
代码简洁
```

不要为了：

* 减少代码行数；
* 减少文件数量；
* 追求“优雅”；
* 追求短代码；

牺牲结构清晰和长期维护性。

---

# 21. 一句话原则

> **让代码清楚表达意图；让 HTML 表达语义；让 Vue 表达交互；让 CSS 表达布局与视觉；让类型表达数据契约；让每一层只做自己的事情。**
