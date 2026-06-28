<!--
  ============================================================
  【自动注册名】<ChapterNav>
    注册原理：nuxt.config.ts 配置 srcDir = 'app/' 且 components.dirs = '~/components'
    Nuxt 自动扫描 app/components/**/*.vue，按目录路径+文件名 PascalCase 转换
    本文件路径：app/components/course/ChapterNav.vue → 注册名：ChapterNav
  ============================================================
  【Props 概览】
    prev   字段名：prev   类型：{ slug: string; title: string } | null | undefined   必填：否   默认值：undefined
    next   字段名：next   类型：{ slug: string; title: string } | null | undefined   必填：否   默认值：undefined
  ============================================================
  【Emit 事件】无（组件未调用 defineEmits，仅作为纯展示型导航组件）
  ============================================================
  【引用方搜索结果】
    ① docs/README.md:80 — 架构文档中列出组件位置说明（注释性质）
    ② 实际页面引用：暂未搜索到 <ChapterNav 标签调用（组件处于待集成状态）
    预期使用方：课时详情页 /course/[chapter]/[lesson].vue 或章节概览页底部
  ============================================================
  【数据流向】
    父组件 → props(prev, next) → ChapterNav
      ↑                          ↓
      │                    NuxtLink 导航渲染
      │                    跳转路径：/course/${slug}
      │
      数据来源：useCourse composable 的 getChapterNavigation(courseSlug, chapterSlug)
               返回 { prev, next } 结构，由父组件（如课时详情页）获取后传入
  ============================================================
  ChapterNav 组件 - 章节导航
  功能说明：
  - 在章节内容底部展示"上一章"和"下一章"的导航链接
  - 左侧显示上一章（带左箭头），右侧显示下一章（带右箭头）
  - 如果没有上一章或下一章，显示占位元素保持布局对称
  - 移动端（≤768px）切换为垂直布局，隐藏占位元素
-->
<template>
  <!-- 章节导航根容器：flex 两端对齐布局，控制左右两项的间距和分隔线 -->
  <div class="chapter-nav">
    <!-- 上一章导航项：仅当 props.prev 为 truthy（非 null/undefined）时渲染 -->
    <!-- NuxtLink 跳转目标路径：/course/${prev.slug}，slug 来自 props.prev 对象的 slug 字段 -->
    <!-- 样式修饰符 chapter-nav__item--prev：控制左对齐布局 + 左侧箭头位置 -->
    <NuxtLink
      v-if="prev"
      :to="`/course/${prev.slug}`"
      class="chapter-nav__item chapter-nav__item--prev"
    >
      <!-- 左箭头 SVG 图标：通过 stroke="currentColor" 继承文本颜色，stroke-linecap/join 圆角处理 -->
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <!-- 上一章信息容器：垂直排列"上一章"标签 + 章节标题 -->
      <div class="chapter-nav__info">
        <!-- 导航方向标签：固定文案"上一章"，小号大写字母样式 -->
        <span class="chapter-nav__label">上一章</span>
        <!-- 上一章标题文本：绑定 props.prev.title，由父组件传入 -->
        <span class="chapter-nav__title">{{ prev.title }}</span>
      </div>
    </NuxtLink>
    <!-- 上一章占位元素：当 props.prev 为 falsy 时渲染，仅用于撑满布局保持左右对称 -->
    <!-- 与 chapter-nav__item 共用相同的 flex:1 + max-width:48% 样式，确保右项位置不偏移 -->
    <div v-else class="chapter-nav__placeholder"></div>

    <!-- 下一章导航项：仅当 props.next 为 truthy（非 null/undefined）时渲染 -->
    <!-- 跳转目标路径：/course/${next.slug}，slug 来自 props.next 对象的 slug 字段 -->
    <!-- 样式修饰符 chapter-nav__item--next：控制右对齐布局 + 右侧箭头 + row-reverse 反向排列 -->
    <NuxtLink
      v-if="next"
      :to="`/course/${next.slug}`"
      class="chapter-nav__item chapter-nav__item--next"
    >
      <!-- 下一章信息容器：右对齐排列"下一章"标签 + 章节标题 -->
      <div class="chapter-nav__info">
        <!-- 导航方向标签：固定文案"下一章"，小号大写字母样式 -->
        <span class="chapter-nav__label">下一章</span>
        <!-- 下一章标题文本：绑定 props.next.title，由父组件传入 -->
        <span class="chapter-nav__title">{{ next.title }}</span>
      </div>
      <!-- 右箭头 SVG 图标：通过 stroke="currentColor" 继承文本颜色 -->
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </NuxtLink>
    <!-- 下一章占位元素：当 props.next 为 falsy 时渲染，保持左右布局对称 -->
    <div v-else class="chapter-nav__placeholder"></div>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 【组件声明】Vue 3 <script setup> 语法糖
// 组件名自动推导：从文件名 ChapterNav.vue 推导为 PascalCase "ChapterNav"
// Nuxt 全局注册：配合 nuxt.config.ts 的 components.dirs 配置，无需手动 import
// 即可在任意页面/组件中直接使用 <ChapterNav /> 标签
// ============================================================

/**
 * 章节导航组件：上一章/下一章切换
 * @component ChapterNav
 */

// ============================================================
// 【Props 类型声明】使用 Vue 3 泛型 defineProps<T>() 语法
// 编译时由 Vue/TypeScript 提取 props 定义，无需 runtime 运行时对象
// ============================================================
// 字段 prev：
//   字段名：prev
//   类型：{ slug: string; title: string } | null | undefined
//     - slug:  字符串类型，章节 URL 友好标识，用于拼接跳转路径 /course/${slug}
//     - title: 字符串类型，章节展示标题，显示在导航项正文中
//     - null:  表示明确没有上一章（如第一章），此时渲染占位元素
//     - undefined: props 可选类型的默认值（Vue 未传入时的值）
//   必填：否（? 可选修饰符）
//   默认值：undefined（Vue 3 defineProps 泛型语法中 ? 可选字段不传时为 undefined，
//           如需 null 需父组件主动传 prev={null}）
// ----------
// 字段 next：
//   字段名：next
//   类型：{ slug: string; title: string } | null | undefined
//     - slug:  字符串类型，下一章 URL 友好标识
//     - title: 字符串类型，下一章展示标题
//     - null:  表示明确没有下一章（如最后一章）
//     - undefined: 未传入时的默认值
//   必填：否（? 可选修饰符）
//   默认值：undefined
// ============================================================
defineProps<{
  /** 上一章信息对象，包含 slug 和 title，无上一章时为 null */
  prev?: { slug: string; title: string } | null
  /** 下一章信息对象，包含 slug 和 title，无下一章时为 null */
  next?: { slug: string; title: string } | null
}>()
// ============================================================
// 【Emit 声明】本组件未调用 defineEmits()，无自定义事件
// 仅作为纯展示型（Presentational）组件，通过 NuxtLink 原生导航跳转
// 不向父组件传递任何用户交互事件
// ============================================================
</script>

<style scoped>
.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.chapter-nav__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 48%;
}

.chapter-nav__item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.chapter-nav__item--next {
  margin-left: auto;
  text-align: right;
  flex-direction: row-reverse;
}

.chapter-nav__item--next .chapter-nav__info {
  text-align: right;
}

.chapter-nav__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-nav__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chapter-nav__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.chapter-nav__placeholder {
  flex: 1;
  max-width: 48%;
}

@media (max-width: 768px) {
  .chapter-nav {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .chapter-nav__item {
    max-width: 100%;
  }

  .chapter-nav__placeholder {
    display: none;
  }
}
</style>
