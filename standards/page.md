# 调整建议：统一使用 `layouts/default.vue` 作为网站页面框架

## 目标

整个网站统一使用 Nuxt 的 `layouts/default.vue` 作为页面框架。

原因：

对于得心实验室而言，绝大多数页面都会共享：

* Header
* Footer
* 主内容区域
* 左侧导航（可选）
* 右侧栏（可选）

因此这些属于**整个网站的默认布局**，而不是某几个页面的布局。

---

# 一、推荐结构

```text
layouts/
    default.vue

pages/
    index.vue
    about.vue
    privacy.vue
    agreement.vue

    domain/index.vue
           topic/index.vue
                 [lesson].vue

components/
    content/
        ContentView.vue
```

---

# 二、default.vue 的职责

仅负责网站整体框架。

例如：

```text
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│                              │
│ Left │ Main │ Right          │
│                              │
├──────────────────────────────┤
│ Footer                       │
└──────────────────────────────┘
```

default.vue 不允许：

* 请求数据
* 判断 Domain / Topic / Lesson
* 编写业务逻辑
* 渲染 Markdown

它只负责页面骨架。

---

# 三、左右侧栏采用 Slot

不要在 Layout 中写：

```vue
if (route.path)

if (lesson)

if (topic)

if (domain)
```

统一改为 Slot。

例如：

```vue
<AppHeader />

<div class="layout">

    <aside v-if="$slots.left">
        <slot name="left" />
    </aside>

    <main>
        <slot />
    </main>

    <aside v-if="$slots.right">
        <slot name="right" />
    </aside>

</div>

<AppFooter />
```

Layout 不关心里面是什么。

---

# 四、页面负责提供 Slot

## Lesson

```vue
<template>
    <template #left>
        <LessonTree />
    </template>

    <ContentView :content="content" />

    <template #right>
        <ExercisePanel />
    </template>
</template>
```

---

## Topic

```vue
<template>
    <template #left>
        <TopicTree />
    </template>

    <ContentView :content="content" />
</template>
```

---

## Domain

```vue
<template>
    <template #left>
        <DomainNavigation />
    </template>

    <ContentView :content="content" />
</template>
```

---

## About

```vue
<template>

    <ContentView :content="content" />

</template>
```

因为没有提供左右 Slot，

Layout 自动变成：

```text
Header

Main

Footer
```

无需任何判断。

---

# 五、ContentView 保持独立

ContentView 的职责不变。

只负责：

```text
标题

Meta

正文

上一篇

下一篇
```

输入始终只有：

```ts
content
```

禁止接收：

* lesson
* topic
* domain

ContentView 永远不知道内容来自哪里。

---

# 六、职责划分

## default.vue

负责：

* Header
* Footer
* 页面框架
* 左右栏容器
* 响应式布局

禁止：

* 数据请求
* Markdown 渲染
* 页面业务

---

## Page

负责：

* 获取数据
* 生成统一 Content
* 提供左右 Slot 内容

---

## ContentView

负责：

* 展示 Content

---

## MarkdownRenderer

负责：

* Markdown → HTML（或 VNode）

---

# 七、最终架构

```text
layouts/default.vue
│
├── Header
├── Left Slot（可选）
├── Main Slot
├── Right Slot（可选）
└── Footer
        │
        ▼
Page
│
├── 获取数据
├── 提供左侧栏（可选）
├── 提供正文
└── 提供右侧栏（可选）
        │
        ▼
ContentView
        │
        ▼
MarkdownRenderer
```

该方案作为展示层统一规范执行。

核心原则：

1. 全站只维护一个默认布局（`layouts/default.vue`）。
2. 左右侧栏全部采用 Slot 实现，不依赖路由判断。
3. 没有提供 Slot 时自动隐藏对应区域。
4. 展示层始终围绕统一的 `Content` 模型，不区分 Domain、Topic、Lesson。
5. 保持布局、页面、内容、渲染四层职责独立，避免后续耦合。
