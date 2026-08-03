下面是 `03-coding-style.md`。

定位：**代码表达规范**。
它不决定架构职责（02负责），只规定“在已经确定职责后，代码应该如何书写”。

# Coding Style

## 1. 文档定位

本文档规定得心实验室项目的代码书写规范。

目标：

- 保持代码一致性；
- 提高可读性；
- 降低多人和 AI Agent 协作成本；
- 让代码结构能够长期维护。

所有新增代码应遵循本文档。

---

# 2. 基本原则

## 2.1 可读性优先

代码首先服务于阅读者。

优先：

- 清晰命名；
- 明确结构；
- 简单逻辑。

避免：

- 过度简写；
- 晦涩技巧；
- 单行复杂表达式。

---

## 2.2 显式优于隐式

推荐：

```ts
const lessonTitle = lesson.title
````

避免：

```ts
const t = l.t
```

变量名称应表达真实含义。

---

## 2.3 一个函数一个职责

函数应该：

* 完成单一任务；
* 保持较小规模；
* 易于测试。

避免：

一个函数同时：

* 获取数据；
* 处理业务；
* 格式转换；
* 修改状态。

---

# 3. TypeScript 规范

## 3.1 类型要求

核心业务代码必须使用明确类型。

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

## 3.2 禁止滥用 any

`any` 只能用于：

* 第三方库类型缺失；
* 临时兼容处理。

正常业务代码禁止使用。

---

## 3.3 类型命名

接口：

```ts
Lesson
LessonDetail
LessonMetadata
```

类型：

```ts
ContentNode
RenderResult
```

避免：

```ts
Data
Info
Object
Thing
```

等无意义名称。

---

# 4. 文件命名规范

## 4.1 通用文件

使用：

```
kebab-case
```

例如：

```
lesson-service.ts
content-loader.ts
markdown-parser.ts
```

---

## 4.2 Vue 组件

使用：

```
PascalCase
```

例如：

```
LessonCard.vue
ContentRenderer.vue
AppHeader.vue
```

---

## 4.3 常量

使用：

```
UPPER_SNAKE_CASE
```

例如：

```ts
const MAX_LESSON_COUNT = 20
```

---

# 5. 目录规范

目录名称表达职责。

推荐：

````
services/
repositories/
components/
composables/
types/
utils/
``` id="0xk5yu"

避免：

````

misc/
common2/
temp/
helpers/

````

等无法表达职责的目录。

---

# 6. Vue 组件规范

## 6.1 组件结构

推荐：

```vue
<script setup lang="ts">

</script>

<template>

</template>

<style scoped>

</style>
````

---

## 6.2 Script 顺序

推荐：

1. imports
2. props
3. emits
4. state
5. computed
6. methods
7. lifecycle

---

## 6.3 Props

Props 必须具有明确类型。

推荐：

```ts
const props = defineProps<{
  lessonId: string
}>()
```

---

避免：

```ts
defineProps(['lessonId'])
```

---

# 7. Vue 组件职责规范

## 展示组件

特点：

* 接收数据；
* 展示内容；
* 处理简单交互。

例如：

````
LessonCard.vue
MarkdownRenderer.vue
``` id="a1z4r9"

---

## 页面组件

负责：

- 页面组合；
- 调用 composable/service；
- 管理页面状态。

例如：

````

pages/lesson/[slug].vue

````

---

禁止：

在展示组件中：

- 查询数据库；
- 调用业务服务；
- 处理复杂流程。

---

# 8. CSS 规范

## 8.1 优先语义化命名

推荐：

```css
.lesson-header
.lesson-content
.lesson-sidebar
````

避免：

```css
.red-box
.big-left
.test1
```

---

## 8.2 使用设计变量

推荐：

```css
color: var(--color-text-primary);
```

避免：

```css
color: #333333;
```

大量散落。

---

## 8.3 布局原则

优先：

* Flex；
* Grid；
* 正常文档流。

避免：

大量：

* absolute 定位；
* 固定高度。

---

# 9. HTML 规范

优先使用语义标签：

推荐：

```html
<main>
<article>
<section>
<aside>
<header>
<footer>
<nav>
```

---

避免：

```html
<div class="main">
<div class="section">
```

替代标准语义。

---

# 10. 注释规范

## 10.1 注释说明原因

推荐：

```ts
// 保留 HTML 输出，避免客户端重复解析 Markdown
```

---

避免：

```ts
// 设置 html
const html = value
```

---

## 10.2 不写无意义注释

代码已经表达清楚时，不增加重复说明。

---

# 11. 导入规范

保持：

* 分组；
* 顺序稳定。

推荐：

```ts
// Vue
import { computed } from 'vue'

// External
import { z } from 'zod'

// Internal
import { lessonService } from '@/core/content'
```

---

# 12. 错误处理

错误必须：

* 明确；
* 可追踪；
* 不静默失败。

避免：

```ts
try {

} catch {

}
```

空处理。

---

# 13. AI Agent 代码要求

AI Agent 输出代码时必须：

* 遵守已有目录结构；
* 使用项目已有抽象；
* 避免创造重复实现。

禁止：

* 为简单功能创建新层；
* 修改无关文件；
* 大范围格式化代码。

---

# 14. 代码审查标准

检查：

## 结构

* 是否符合模块职责？

## 类型

* 是否有明确类型？

## 命名

* 是否容易理解？

## 维护

* 六个月后是否容易阅读？

---

# 15. 优先级

代码质量优先级：

```
正确性
 ↓
可维护性
 ↓
可读性
 ↓
性能优化
 ↓
代码简洁
```

不要为了减少代码行数牺牲结构清晰。

