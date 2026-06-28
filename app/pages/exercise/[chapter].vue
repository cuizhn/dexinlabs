<!-- 路由 URL 匹配规则：/exercise/:chapter，例如 /exercise/basic-algebra -->
<!-- 页面用途：章节练习页，用于展示指定章节对应的数学思维交互练习题（questions 字段）及说明 -->
<template>
  <!-- 根容器：练习页整体布局包裹 -->
  <div class="exercise-page">
    <!-- 顶部 header 区块：展示面包屑导航、页面大标题、练习理念说明 -->
    <section class="exercise-page__header">
      <!-- 内容容器：限制最大宽度居中 -->
      <div class="container">
        <!-- 面包屑导航栏：三级路径 课程中心 → 章节 → 章节练习 -->
        <nav class="exercise-page__breadcrumb">
          <!-- 返回课程中心链接：固定跳转到 /course 路由（课程列表总览页） -->
          <NuxtLink to="/course" class="exercise-page__bc-link">课程中心</NuxtLink>
          <!-- 面包屑分隔符：斜杠 -->
          <span class="exercise-page__bc-sep">/</span>
          <!-- 章节链接：当 chapterSlug 存在时，跳转到 /course/:chapter 章节详情页，展示章节标题或占位"章节" -->
          <NuxtLink v-if="chapterSlug" :to="`/course/${chapterSlug}`" class="exercise-page__bc-link">
            {{ chapterTitle || '章节' }}
          </NuxtLink>
          <!-- 面包屑分隔符：斜杠 -->
          <span class="exercise-page__bc-sep">/</span>
          <!-- 当前页面标识：固定文字"章节练习"，不可点击 -->
          <span class="exercise-page__bc-current">章节练习</span>
        </nav>
        <!-- 页面主标题 h1：若有章节标题则拼接为"{章节名} · 练习"，否则回退为"章节练习" -->
        <h1 class="exercise-page__title">
          {{ chapterTitle ? `${chapterTitle} · 练习` : '章节练习' }}
        </h1>
        <!-- 页面理念描述：引导性文案，阐述数学思维练习的流程与意义 -->
        <p class="exercise-page__desc">
          思考 → 尝试 → 提示 → 修正 → 理解 → 总结 → 迁移。让每一次练习都成为思维的生长。
        </p>
      </div>
    </section>

    <!-- 主体 body 区块：展示练习内容，含三种分支（加载中 / 正常渲染 / 练习未准备占位） -->
    <section class="exercise-page__body">
      <!-- 内容容器：限制最大宽度居中 -->
      <div class="container exercise-page__container">
        <!-- 分支一：loading 为 true 时展示加载中占位文案 -->
        <div v-if="loading" class="exercise-page__empty">练习内容加载中...</div>
        <!-- 分支二：exercise 数据存在时，渲染练习详情 -->
        <template v-else-if="exercise">
          <!-- 练习子标题 h2：从 exercise 对象取 title 字段展示，回退为"练习题" -->
          <h2 class="exercise-page__section-title">{{ (exercise as any).title || '练习题' }}</h2>
          <!-- 练习介绍区：若 exercise.description 字段存在，则展示引导性描述文案（带左侧色条卡片样式） -->
          <div v-if="(exercise as any).description" class="exercise-page__intro">
            {{ (exercise as any).description }}
          </div>
          <!-- 交互题目渲染：使用 ContentRenderer 组件渲染 exercise 对象的 questions/body 等字段 -->
          <!-- ContentRenderer 是 @nuxt/content 内置组件，数据源为 exercise 对象（含 questions 列表、Markdown 正文等） -->
          <ContentRenderer v-if="exercise" :value="exercise as any" />
        </template>
        <!-- 分支三（404/未准备 逻辑）：既非加载中又无 exercise 数据时，展示"练习内容准备中"友好占位卡片 -->
        <!-- 占位卡片提供引导性文案，并提供 ← 返回章节页的跳转链接（跳转 /course/:chapter） -->
        <div v-else class="exercise-page__placeholder">
          <div class="placeholder-card">
            <div class="placeholder-card__icon">✎</div>
            <h3 class="placeholder-card__title">练习内容准备中</h3>
            <p class="placeholder-card__desc">
              本章节的交互练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。
            </p>
            <NuxtLink
              v-if="chapterSlug"
              :to="`/course/${chapterSlug}`"
              class="placeholder-card__back"
            >
              ← 返回章节页
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 从 nuxt/app 导入 useHead（设置页面 <head> 元信息，如 title）和 useRoute（获取当前路由对象及 params 参数）
import { useHead, useRoute } from 'nuxt/app'
// 从 vue 导入 computed（创建计算属性，响应式地派生数据，如 chapterTitle、页面 title）
import { computed } from 'vue'
// 导入 useExercise composable：封装章节练习数据的加载与状态，提供 exercise（练习详情，含 questions/title/description 等字段）、loading（加载状态）和 loadExercise 方法
// 最终 API endpoint：GET /api/exercise/:chapterSlug（通过 ExerciseRepository.findBySlug 调用）
import { useExercise } from '../../composables/useExercise'
// 导入 useChapter composable：封装章节数据的加载与状态，提供 currentChapter（章节详情，含 title 用于页面标题与面包屑）和 loadChapter 方法
// 最终 API endpoint：GET /api/chapter/:chapterSlug（通过 ChapterRepository.findBySlug 调用）
import { useChapter } from '../../composables/useChapter'

// 调用 useRoute() 获取当前路由实例，用于读取动态路由 params 中的 chapter 片段
const route = useRoute()
// 路由参数 chapter 提取流程：params.chapter 可能是字符串或字符串数组（catch-all 路由时为数组）
// 判断若是数组则取第一个元素，否则直接使用字符串值，最终得到统一的 string 类型 chapterSlug
const chapterSlug = Array.isArray(route.params.chapter)
  ? route.params.chapter[0]
  : route.params.chapter

// 调用 useHead 设置页面 meta 信息
// title 计算逻辑：chapterTitle.value 存在时拼接为"{章节标题} · 练习"，否则回退为"章节练习"
useHead({
  title: computed(() => (chapterTitle.value ? `${chapterTitle.value} · 练习` : '章节练习')),
})

// 调用 useExercise composable 解构出：
// - exercise：响应式 Ref，承载练习详情（含 title、description、questions 列表等字段用于 ContentRenderer 渲染）
// - loading：响应式 Ref<boolean>，加载中状态，驱动 template 加载中分支显示
// - loadExercise：异步方法，传入 chapterSlug 请求该章节的练习数据
const { exercise, loading, loadExercise } = useExercise()
// 调用 useChapter composable 解构出：
// - currentChapter：响应式 Ref，承载所属章节详情（含 title 用于面包屑、页面标题 h1、useHead title）
// - loadChapter：异步方法，传入 chapterSlug 请求章节数据
const { currentChapter, loadChapter } = useChapter()

// chapterSlug 有值时，顺序执行两个异步加载：
// 1. loadChapter(chapterSlug)：发起请求 GET /api/chapter/:chapterSlug 获取章节详情
// 2. loadExercise(chapterSlug)：发起请求 GET /api/exercise/:chapterSlug 获取该章节对应练习
if (chapterSlug) {
  await loadChapter(chapterSlug)
  await loadExercise(chapterSlug)
}

// 计算属性 chapterTitle：从 currentChapter.value（章节详情对象）上取 .title 字段，用于面包屑、h1 标题、useHead title 展示
const chapterTitle = computed(() => currentChapter.value?.title)
</script>

<style scoped>
.exercise-page__header {
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-secondary), transparent);
}
.exercise-page__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}
.exercise-page__bc-link { color: var(--color-text-secondary); text-decoration: none; }
.exercise-page__bc-link:hover { color: var(--color-primary); }
.exercise-page__bc-sep { color: var(--color-text-light); }
.exercise-page__bc-current { color: var(--color-text-primary); font-weight: 500; }
.exercise-page__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.exercise-page__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 640px;
  line-height: 1.6;
  margin: 0;
}
.exercise-page__body { padding: var(--spacing-xl) 0 var(--spacing-3xl); }
.exercise-page__container { max-width: 760px; }
.exercise-page__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}
.exercise-page__intro {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}
.exercise-page__empty,
.exercise-page__placeholder { padding: var(--spacing-2xl) 0; }
.placeholder-card {
  padding: var(--spacing-3xl) var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius-lg);
  text-align: center;
}
.placeholder-card__icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.placeholder-card__desc {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 440px;
  margin: 0 auto var(--spacing-lg);
}
.placeholder-card__back {
  display: inline-block;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}
.placeholder-card__back:hover { text-decoration: underline; }
</style>
