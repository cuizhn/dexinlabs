<!-- 页面路径: /courses/[slug] -->
<!-- 课程详情页：展示课程基本信息、章节列表和侧边栏课程信息卡片 -->
<template>
  <div class="course-detail-page">
    <!-- 课程头部区域：图标、标题、描述和元信息 -->
    <section v-if="course" class="course-detail-page__hero">
      <div class="container">
        <div class="course-detail-page__hero-inner">
          <div class="course-detail-page__icon">{{ course.icon }}</div>
          <div class="course-detail-page__hero-text">
            <h1 class="course-detail-page__title">{{ course.title }}</h1>
            <p class="course-detail-page__description">{{ course.description }}</p>
            <div class="course-detail-page__meta">
              <span class="course-detail-page__meta-item">📖 {{ course.chapters.length }} 个章节</span>
              <span class="course-detail-page__difficulty" :class="`course-detail-page__difficulty--${course.difficulty}`">
                {{ getDifficultyLabel(course.difficulty) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程内容区：左侧章节列表 + 右侧信息卡片 -->
    <section v-if="course" class="course-detail-page__content">
      <div class="container">
        <div class="course-detail-page__grid">
          <!-- 章节列表 -->
          <div class="course-detail-page__chapters">
            <h2 class="course-detail-page__section-title">课程章节</h2>
            <div class="course-detail-page__chapter-list">
              <NuxtLink
                v-for="chapter in course.chapters"
                :key="chapter.slug"
                :to="`/courses/${course.id}/${chapter.slug}`"
                class="course-detail-page__chapter-card"
              >
                <span class="course-detail-page__chapter-order">{{ chapter.order }}</span>
                <div class="course-detail-page__chapter-info">
                  <h3 class="course-detail-page__chapter-title">{{ chapter.title }}</h3>
                  <span class="course-detail-page__chapter-action">开始学习 →</span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- 侧边栏：课程信息卡片和开始学习按钮 -->
          <aside class="course-detail-page__sidebar">
            <div class="course-detail-page__info-card">
              <h3 class="course-detail-page__info-title">课程信息</h3>
              <ul class="course-detail-page__info-list">
                <li class="course-detail-page__info-item">
                  <span class="course-detail-page__info-label">难度</span>
                  <span class="course-detail-page__info-value">{{ getDifficultyLabel(course.difficulty) }}</span>
                </li>
                <li class="course-detail-page__info-item">
                  <span class="course-detail-page__info-label">章节</span>
                  <span class="course-detail-page__info-value">{{ course.chapters.length }} 章</span>
                </li>
              </ul>
              <NuxtLink
                v-if="course.chapters.length"
                :to="`/courses/${course.id}/${course.chapters[0].slug}`"
                class="course-detail-page__start-btn"
              >
                开始学习
              </NuxtLink>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- 课程未找到提示 -->
    <section v-if="!course" class="course-detail-page__not-found">
      <div class="container container-sm text-center">
        <h2 class="course-detail-page__not-found-title">课程未找到</h2>
        <p class="course-detail-page__not-found-text">请检查课程链接是否正确</p>
        <NuxtLink to="/courses" class="course-detail-page__back-link">返回课程列表</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useCourse } from '~/composables/course/useChapter'

const route = useRoute()

const { getCourse } = useCourse()

const { data: course } = await useAsyncData(
  `course-${route.params.slug}`,
  () => getCourse(route.params.slug)
)

if (!course.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '课程不存在'
  })
}
// 动态设置页面标题
useHead(() => ({
  title: course.value ? course.value.title : '课程未找到',
}))

// 难度标签映射：将英文难度值转为中文显示
function getDifficultyLabel(difficulty) {
  const labels = { beginner: '入门', intermediate: '进阶', advanced: '高级' }
  return labels[difficulty] || '未知'
}
</script>

<style scoped>
/* ==================== 页面布局 ==================== */
/* 页面根容器 */
.course-detail-page { padding-bottom: var(--spacing-2xl); }
/* 课程头部：灰色背景，底部带分隔线 */
.course-detail-page__hero { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); }
/* 头部内容：图标和文字横向排列 */
.course-detail-page__hero-inner { display: flex; align-items: center; gap: var(--spacing-xl); }
/* 课程图标：圆角方块，主色背景 */
.course-detail-page__icon { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background-color: var(--color-primary-light); color: var(--color-primary); border-radius: var(--border-radius-xl); font-size: 2rem; font-weight: 700; flex-shrink: 0; }
/* 课程标题 */
.course-detail-page__title { font-size: 2rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--spacing-sm) 0; }
/* 课程描述 */
.course-detail-page__description { font-size: 1.125rem; color: var(--color-text-secondary); margin: 0 0 var(--spacing-md) 0; }
/* 元信息行：章节数和难度标签 */
.course-detail-page__meta { display: flex; align-items: center; gap: var(--spacing-md); }
/* 元信息项 */
.course-detail-page__meta-item { display: flex; align-items: center; gap: var(--spacing-xs); font-size: 0.875rem; color: var(--color-text-secondary); }
/* 难度标签：胶囊形 */
.course-detail-page__difficulty { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
/* 入门难度：绿色 */
.course-detail-page__difficulty--beginner { background-color: #dcfce7; color: #166534; }
/* 进阶难度：橙色 */
.course-detail-page__difficulty--intermediate { background-color: #fef3c7; color: #92400e; }
/* 高级难度：红色 */
.course-detail-page__difficulty--advanced { background-color: #fee2e2; color: #991b1b; }

/* ==================== 课程内容区 ==================== */
/* 内容区域 */
.course-detail-page__content { padding: var(--spacing-2xl) 0; }
/* 两栏网格：左侧章节列表 + 右侧信息卡片 */
.course-detail-page__grid { display: grid; grid-template-columns: 1fr 300px; gap: var(--spacing-xl); align-items: start; }
/* 章节区域标题 */
.course-detail-page__section-title { font-size: 1.25rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 var(--spacing-lg) 0; }
/* 章节列表：纵向排列 */
.course-detail-page__chapter-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
/* 章节卡片：横向布局，悬停高亮并右移 */
.course-detail-page__chapter-card { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-lg); background-color: var(--color-bg-white); border: 1px solid var(--color-border); border-radius: var(--border-radius-lg); text-decoration: none; color: inherit; transition: all 0.2s ease; }
/* 章节卡片悬停效果 */
.course-detail-page__chapter-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-md); transform: translateX(4px); }
/* 章节序号：圆形主色背景 */
.course-detail-page__chapter-order { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: var(--color-primary-light); color: var(--color-primary); font-size: 0.875rem; font-weight: 600; flex-shrink: 0; }
/* 章节信息：标题和操作文字 */
.course-detail-page__chapter-info { flex: 1; display: flex; align-items: center; justify-content: space-between; }
/* 章节标题 */
.course-detail-page__chapter-title { font-size: 1rem; font-weight: 500; color: var(--color-text-primary); margin: 0; }
/* 章节操作文字 */
.course-detail-page__chapter-action { font-size: 0.875rem; color: var(--color-primary); font-weight: 500; }

/* ==================== 侧边栏信息卡片 ==================== */
/* 信息卡片：吸顶定位 */
.course-detail-page__info-card { position: sticky; top: 80px; padding: var(--spacing-lg); background-color: var(--color-bg-white); border: 1px solid var(--color-border); border-radius: var(--border-radius-lg); }
/* 信息卡片标题 */
.course-detail-page__info-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 var(--spacing-md) 0; }
/* 信息列表 */
.course-detail-page__info-list { list-style: none; padding: 0; margin: 0 0 var(--spacing-lg) 0; }
/* 信息项：标签和值左右分布 */
.course-detail-page__info-item { display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--color-border); }
.course-detail-page__info-item:last-child { border-bottom: none; }
/* 信息标签 */
.course-detail-page__info-label { font-size: 0.875rem; color: var(--color-text-secondary); }
/* 信息值 */
.course-detail-page__info-value { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
/* 开始学习按钮：全宽主色按钮 */
.course-detail-page__start-btn { display: block; width: 100%; padding: var(--spacing-sm) var(--spacing-md); background-color: var(--color-primary); color: #fff; text-align: center; text-decoration: none; border-radius: var(--border-radius-md); font-weight: 500; font-size: 0.9375rem; transition: background-color 0.2s ease; }
/* 开始学习按钮悬停 */
.course-detail-page__start-btn:hover { background-color: var(--color-primary-dark); }

/* ==================== 未找到提示 ==================== */
.course-detail-page__not-found { padding: var(--spacing-2xl) 0; text-align: center; }
.course-detail-page__not-found-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); }
.course-detail-page__not-found-text { color: var(--color-text-secondary); margin-bottom: var(--spacing-lg); }
.course-detail-page__back-link { display: inline-block; padding: var(--spacing-sm) var(--spacing-lg); background-color: var(--color-primary); color: #fff; text-decoration: none; border-radius: var(--border-radius-md); font-weight: 500; }

/* ==================== 响应式适配 ==================== */
/* 手机端：头部纵向排列，内容区单列 */
@media (max-width: 768px) {
  .course-detail-page__hero-inner { flex-direction: column; text-align: center; }
  .course-detail-page__meta { justify-content: center; }
  .course-detail-page__grid { grid-template-columns: 1fr; }
  .course-detail-page__title { font-size: 1.5rem; }
  .course-detail-page__chapter-info { flex-direction: column; align-items: flex-start; gap: var(--spacing-xs); }
}
</style>
