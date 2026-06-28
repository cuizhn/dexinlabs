<!--
  ============================================================
  【自动注册名】<CourseSidebar>
    注册原理：nuxt.config.ts 配置 srcDir = 'app/' 且 components.dirs = '~/components'
    Nuxt 自动扫描 app/components/**/*.vue，按目录路径+文件名 PascalCase 转换
    本文件路径：app/components/course/CourseSidebar.vue → 注册名：CourseSidebar
  ============================================================
  【Props 概览】
    chapters     字段名：chapters     类型：ChapterSidebarItem[]           必填：是   默认值：无（必填）
      子字段：
        slug    string              章节 URL 唯一标识（用于跳转路径匹配）
        order   number | string     章节序号（数字或字符串，显示在圆形徽章中）
        title   string              章节标题
    currentSlug  字段名：currentSlug  类型：string | undefined              必填：否   默认值：undefined
      用于高亮当前激活项：chapters[i].slug === currentSlug 时追加 --active 修饰类
  ============================================================
  【Emit 事件】无（通过 NuxtLink 原生导航跳转，不向父组件 emit 事件）
  ============================================================
  【引用方搜索结果】
    ① docs/README.md:82 — 架构文档中列出组件位置说明（章节列表侧边栏）
    ② 实际页面引用：暂未搜索到 <CourseSidebar 标签调用（待集成到课时详情页）
    预期使用方：课时详情页 /course/[chapter]/[lesson].vue 左侧或章节概览页 /course/[chapter].vue
  ============================================================
  【数据流向】
    父组件 → props(chapters, currentSlug) → CourseSidebar
      ↑                                            ↓
      │                                      NuxtLink 跳转 /course/${slug}
      │                                      slug 匹配时高亮 --active 样式
      │
      数据来源：useChapter composable 的 chapters.value（Ref<ChapterListItem[]>）
               父组件将章节列表转换为 ChapterSidebarItem[] 结构后传入
               currentSlug 来自 useRoute().params.chapter
  ============================================================
  CourseSidebar 组件 - 章节目录侧边栏
  功能说明：
  - 展示课程的章节目录列表，用于课程详情页的侧边栏导航
  - 每个章节项显示序号和标题，点击跳转到对应章节页面
  - 当前章节高亮显示（通过 currentSlug 匹配）
  - 使用 sticky 定位，滚动时固定在视口顶部
-->
<template>
  <!-- 课程侧边栏根容器：position: sticky; top: 80px，滚动时固定在视口顶部 -->
  <div class="course-sidebar">
    <!-- 侧边栏标题：固定文案"章节目录"，小号大写字母样式，带左右内边距与列表项对齐 -->
    <h3 class="course-sidebar__title">章节目录</h3>
    <!-- 章节导航列表：nav 语义化标签，垂直排列章节链接项，gap 控制项间距 -->
    <nav class="course-sidebar__list">
      <!-- 遍历 chapters 数组渲染每个章节项：v-for 指令 -->
      <!-- :key 使用 chapter.slug（唯一 URL 标识）保证列表 Diff 性能 -->
      <!-- :to 跳转路径：/course/${chapter.slug}，对应动态路由 /course/[chapter].vue -->
      <!-- 动态 class 绑定：chapter.slug === currentSlug 时追加 --active 修饰类，高亮显示 -->
      <NuxtLink
        v-for="chapter in chapters"
        :key="chapter.slug"
        :to="`/course/${chapter.slug}`"
        class="course-sidebar__item"
        :class="{ 'course-sidebar__item--active': chapter.slug === currentSlug }"
      >
        <!-- 章节序号徽章：圆形背景，展示 chapter.order（number|string 直接渲染） -->
        <!-- 激活状态时徽章背景色改为主色，文字变白 -->
        <span class="course-sidebar__order">{{ chapter.order }}</span>
        <!-- 章节标题文本：绑定 chapter.title，line-height 控制多行时行间距 -->
        <span class="course-sidebar__name">{{ chapter.title }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 【组件声明】Vue 3 <script setup> 语法糖
// 组件名自动推导：从文件名 CourseSidebar.vue 推导为 PascalCase "CourseSidebar"
// Nuxt 全局注册：配合 nuxt.config.ts 的 components.dirs 配置，无需手动 import
// ============================================================

/**
 * 课程侧边栏组件：展示章节列表，高亮当前章节
 * @component CourseSidebar
 */

// ============================================================
// 【接口定义 ChapterSidebarItem】侧边栏章节条目数据结构
//   slug: string              — 章节 URL 唯一标识，用于 :to 跳转路径和 v-for :key
//   order: number | string    — 章节序号，兼容数字（1/2/3）和字符串（"01"/"第一章"）两种格式
//   title: string             — 章节展示标题
// ============================================================
interface ChapterSidebarItem {
  slug: string
  order: number | string
  title: string
}

// ============================================================
// 【Props 声明】使用泛型 defineProps<T>() 语法，不解构（因为 template 直接访问 props 字段）
// ----------
// 字段 chapters：
//   字段名：chapters
//   类型：ChapterSidebarItem[]（数组，每项为一个章节对象）
//   必填：是（无 ? 可选修饰符，父组件必须传入，否则 TypeScript 编译报错）
//   默认值：无（必填项无默认，空列表传 [] 空数组）
// ----------
// 字段 currentSlug：
//   字段名：currentSlug
//   类型：string | undefined
//   必填：否（? 可选修饰符）
//   默认值：undefined（未传入时，所有项都不匹配，无高亮激活项）
//   用途：与 chapter.slug 做 === 全等比较，命中时 class --active 高亮
// ============================================================
defineProps<{
  chapters: ChapterSidebarItem[]
  currentSlug?: string
}>()
// ============================================================
// 【Emit 声明】本组件未调用 defineEmits()，无自定义事件
// 交互方式：NuxtLink 原生路由跳转，不触发父组件事件
// ============================================================
</script>

<style scoped>
.course-sidebar {
  position: sticky;
  top: 80px;
}

.course-sidebar__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.course-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.course-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.course-sidebar__item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.course-sidebar__item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.course-sidebar__order {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: var(--text-xs);
  font-weight: 600;
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
}

.course-sidebar__item--active .course-sidebar__order {
  background-color: var(--color-primary);
  color: #fff;
}

.course-sidebar__name {
  line-height: 1.4;
}
</style>
