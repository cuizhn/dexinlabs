<!-- 页面路径: /course -->
<!-- 课程中心：数学课程 + 章节列表（核心学习入口） -->
<template>
  <!-- course-index 根容器：包裹整个课程中心页面，用于 scoped 样式作用域隔离 -->
  <div class="course-index">
    <!-- 区块：页面头部横幅区域 - 展示课程中心标签、主标题、副标题介绍，采用渐变背景 -->
    <section class="course-index__header">
      <div class="container">
        <span class="course-index__tag">课程中心</span>
        <h1 class="course-index__title">探索数学的旅程</h1>
        <p class="course-index__subtitle">
          每一个章节都是精心设计的学习单元，从理解到应用，让你真正得心应手
        </p>
      </div>
    </section>

    <!-- 区块：页面主体内容区域 - 根据 loading 状态和 chapters 数据长度，三态渲染：加载中 / 章节卡片网格 / 空状态 -->
    <section class="course-index__body">
      <!-- container 通用布局容器：控制最大宽度和左右内边距，统一页面内容宽度 -->
      <div class="container">
        <!-- loading=true 时显示：加载中文案占位，提示用户数据正在请求中（loading 来自 useChapter composable） -->
        <div v-if="loading" class="course-index__empty">加载中...</div>
        <!-- 数据加载完成且 chapters 数组非空时显示：章节卡片网格容器 -->
        <template v-else-if="chapters.length">
          <!-- course-index__grid：响应式网格布局，自动填充列，每列最小 280px，卡片之间带间距 -->
          <div class="course-index__grid">
            <!-- NuxtLink：Vue Router 链接组件，遍历 chapters 数组渲染每张章节卡片 -->
            <!-- 数据来源：chapters = useChapter() 返回的 Ref<ChapterListItem[]>，由 loadChapters() 填充 -->
            <!-- :key 使用 c.id（章节唯一主键 string）保证列表 Diff 性能 -->
            <!-- :to 跳转到 /course/${c.slug}，即动态路由 [chapter].vue，slug 为 ChapterListItem 字段 -->
            <NuxtLink
              v-for="c in chapters"
              :key="c.id"
              :to="`/course/${c.slug}`"
              class="chapter-card"
            >
              <!-- 章节序号展示：取 c.order（number）转字符串后左侧补 0 至两位，如 1 → "01" -->
              <div class="chapter-card__order">
                {{ String(c.order).padStart(2, '0') }}
              </div>
              <!-- 章节标题：取 c.title（string）字段 -->
              <h2 class="chapter-card__title">{{ c.title }}</h2>
              <!-- 章节描述：仅当 c.description（string | undefined）存在时渲染，展示章节简介 -->
              <p v-if="c.description" class="chapter-card__desc">
                {{ c.description }}
              </p>
              <!-- 卡片底部：带虚线分割线的 CTA 区域，提示点击进入学习 -->
              <div class="chapter-card__footer">
                <span class="chapter-card__cta">进入学习 →</span>
              </div>
            </NuxtLink>
          </div>
        </template>
        <!-- loading=false 且 chapters 为空数组时显示：暂无课程内容空状态提示 -->
        <div v-else class="course-index__empty">暂无课程内容</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 来源：nuxt/app（Nuxt 框架内置模块）
// 用途：useHead 是 Nuxt 提供的组合式函数，用于声明式设置文档头部 meta 信息
//       如页面标题 title、meta description、link 等，支持响应式自动同步
import { useHead } from 'nuxt/app';
// 来源：~/composables/useChapter.ts（项目自定义 composable 模块）
// 用途：useChapter 封装章节相关的响应式状态（chapters/currentChapter/loading）
//       及异步加载方法（loadChapters/loadChapter），内部通过 ChapterRepository 与后端交互
import { useChapter } from '~/composables/useChapter'

// useHead 调用：设置当前页面浏览器标签页的标题为静态字符串"课程中心"
// 调用流程：页面挂载时由 Nuxt 自动收集并应用到 document.title
// 传递参数值：{ title: '课程中心' } —— 静态对象，无响应式依赖
useHead({ title: '课程中心' })

// useChapter() composable 调用：解构获取章节列表页所需的三个公开 API
// 调用流程：
//   1. 进入 useChapter 函数作用域，创建三个 ref（chapters=[]、currentChapter=null、loading=false）
//   2. 定义 loadChapters / loadChapter 两个闭包函数，持有上述 ref 的引用
//   3. 返回包含 5 个属性的对象 { chapters, currentChapter, loading, loadChapters, loadChapter }
//   4. 当前页仅解构需要的 3 个：chapters（章节列表）、loading（加载状态）、loadChapters（加载方法）
// 返回值字段：
//   - chapters: Ref<ChapterListItem[]>，响应式引用，ChapterListItem 字段为：
//       id: string       章节唯一主键，用作 v-for :key
//       slug: string     URL 友好标识，用于跳转 /course/${slug}
//       title: string    章节标题，卡片 h2 显示
//       description?: string  章节描述，可选，卡片 p 显示
//       order: number    排序序号，padStart(2,'0') 后显示
//       [key: string]: unknown  可扩展字段
//   - loading: Ref<boolean>，加载状态标志，被 template v-if="loading" 使用：
//       loading=true  → 显示"加载中..."占位文案（第22行）
//       loading=false → 进入 v-else-if 判断 chapters 长度（第24行）
//   - loadChapters: (courseSlug?: string) => Promise<void>，异步加载函数
const { chapters, loading, loadChapters } = useChapter()

// loadChapters() 调用：触发章节列表数据加载（顶层 await，Nuxt SSR 期间阻塞等待）
// 传递参数值：无参数（courseSlug 为 undefined，即不按课程过滤，获取全部章节）
// 内部调用链：
//   loadChapters()（composable）
//     → ChapterRepository.findAll(undefined)（仓库层）
//       → $fetch<ChapterListItem[]>('/api/chapter', { params: {} })（Nuxt HTTP）
//         → 最终打到后端 server endpoint: GET /api/chapter（无 query 参数）
// 副作用：成功时将结果赋值给 chapters.value，失败时 chapters.value = []（仓库层降级）
//         loading.value 在请求前设 true，请求结束（finally）设 false，驱动 UI 状态切换
await loadChapters()
</script>

<style scoped>
.course-index__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.course-index__tag {
  display: inline-block;
  padding: 4px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 100px;
  margin-bottom: var(--spacing-md);
}
.course-index__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.course-index__subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
.course-index__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.course-index__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}
.chapter-card {
  display: block;
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}
.chapter-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}
.chapter-card__order {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}
.chapter-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
  line-height: 1.4;
}
.chapter-card__desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-lg);
  min-height: 3em;
}
.chapter-card__footer {
  border-top: 1px dashed var(--color-border);
  padding-top: var(--spacing-md);
}
.chapter-card__cta {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
}
.course-index__empty {
  padding: var(--spacing-3xl) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
</style>
