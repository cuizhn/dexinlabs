<!-- 页面路径: /course/[chapter] -->
<!-- 章节概览页：展示章节信息 + 课时列表 + 练习入口 -->
<!-- 真实路由 URL 格式：/course/:chapter，其中 :chapter 为章节 slug（如 /course/algebra-basics） -->
<!-- 路由参数 chapter 来源：Nuxt 文件路由约定，文件名 [chapter].vue 自动注册动态路由段名 chapter -->
<template>
  <!-- chapter-detail 根容器：包裹整个章节详情页，用于 scoped 样式作用域隔离 -->
  <div class="chapter-detail">
    <!-- 主内容分支：currentChapter（Ref<Chapter|null>）非空时渲染章节详情 -->
    <!-- currentChapter 来源：useChapter() 返回，由 loadChapter(chapterSlug) 异步填充 -->
    <template v-if="currentChapter">
      <!-- 区块：章节头部区域 - 展示面包屑导航、章节标题、章节描述，采用渐变背景 -->
      <section class="chapter-detail__header">
        <!-- container 通用布局容器：控制最大宽度和左右内边距 -->
        <div class="container">
          <!-- 面包屑导航：课程中心 → 当前章节，帮助用户定位当前位置并可返回上一级 -->
          <nav class="chapter-detail__breadcrumb">
            <!-- 面包屑第一项：跳转回课程中心 /course（即 index.vue 页面） -->
            <NuxtLink to="/course" class="chapter-detail__bc-link">课程中心</NuxtLink>
            <!-- 面包屑分隔符：斜杠 / -->
            <span class="chapter-detail__bc-sep">/</span>
            <!-- 面包屑当前项：章节标题，取 currentChapter.title（Chapter 字段），非链接不可点击 -->
            <span class="chapter-detail__bc-current">{{ currentChapter.title }}</span>
          </nav>
          <!-- 章节主标题 h1：取 currentChapter.title（string）字段 -->
          <h1 class="chapter-detail__title">{{ currentChapter.title }}</h1>
          <!-- 章节描述：仅当 currentChapter.description（string|undefined）存在时渲染 -->
          <p v-if="currentChapter.description" class="chapter-detail__desc">
            {{ currentChapter.description }}
          </p>
        </div>
      </section>

      <!-- 区块：页面主体内容区域 - 左侧主栏（课时列表）+ 右侧边栏（章节练习入口卡片）双列布局 -->
      <section class="chapter-detail__body">
        <!-- chapter-detail__layout 双列网格布局容器：桌面端 1fr 320px，移动端堆叠 -->
        <div class="container chapter-detail__layout">
          <!-- chapter-detail__main 主内容栏：课时列表区域，min-width:0 防止网格溢出 -->
          <div class="chapter-detail__main">
            <!-- 课时列表区节标题 -->
            <h2 class="chapter-detail__section-title">课时内容</h2>
            <!-- loading=true 时显示：课时加载中文案占位 -->
            <!-- loading 来源：useChapter() 返回的 Ref<boolean>，loadChapter 执行期间为 true -->
            <div v-if="loading" class="chapter-detail__empty">加载中...</div>
            <!-- loading=false 且 lessons（computed<Lesson[]>）非空时显示：有序课时列表 -->
            <!-- lessons 来源：computed 从 currentChapter.lessons 派生，类型强转为 Lesson[] -->
            <ol v-else-if="lessons.length" class="lesson-list">
              <!-- 遍历 lessons 数组渲染每个课时列表项 -->
              <!-- :key 使用 (lesson as any).slug（Lesson.slug，string）保证列表 Diff 性能 -->
              <!-- idx：v-for 索引（从 0 开始），显示序号时 +1 -->
              <li v-for="(lesson, idx) in lessons" :key="(lesson as any).slug" class="lesson-list__item">
                <!-- NuxtLink：点击跳转至课时详情页，路径格式 /course/${chapterSlug}/${lesson.slug} -->
                <!-- chapterSlug 来源：route.params.chapter 提取的字符串 -->
                <NuxtLink
                  :to="`/course/${chapterSlug}/${(lesson as any).slug}`"
                  class="lesson-list__link"
                >
                  <!-- 课时序号：(idx+1) 转字符串后左补 0 至两位，如 idx=0 → "01" -->
                  <span class="lesson-list__index">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <!-- 课时信息容器：标题 + 描述 垂直排列 -->
                  <div class="lesson-list__info">
                    <!-- 课时标题：取 (lesson as any).title（Lesson.title，string）字段 -->
                    <span class="lesson-list__title">{{ (lesson as any).title }}</span>
                    <!-- 课时描述：仅当 (lesson as any).description（string）存在时渲染 -->
                    <span v-if="(lesson as any).description" class="lesson-list__desc">
                      {{ (lesson as any).description }}
                    </span>
                  </div>
                  <!-- 右箭头 CTA：hover 时变色并向右平移 4px，提示可点击 -->
                  <span class="lesson-list__arrow">→</span>
                </NuxtLink>
              </li>
            </ol>
            <!-- loading=false 且 lessons 为空数组时显示：暂无课时内容空状态 -->
            <div v-else class="chapter-detail__empty">暂无课时内容</div>
          </div>

          <!-- 侧边栏：sticky 粘性定位（top:80px），桌面端固定在右侧，移动端静态跟随 -->
          <aside class="chapter-detail__side">
            <!-- 章节练习入口卡片：渐变背景，跳转至 /exercise/${chapterSlug}（章节练习页） -->
            <NuxtLink
              :to="`/exercise/${chapterSlug}`"
              class="exercise-card"
            >
              <!-- 装饰图标：✦ -->
              <div class="exercise-card__icon">✦</div>
              <!-- 卡片正文：标题 + 描述 -->
              <div class="exercise-card__body">
                <h3 class="exercise-card__title">章节练习</h3>
                <p class="exercise-card__desc">巩固所学，训练数学思维</p>
              </div>
              <!-- CTA 文案：开始练习 → -->
              <span class="exercise-card__cta">开始练习 →</span>
            </NuxtLink>
          </aside>
        </div>
      </section>
    </template>

    <!-- 空状态分支：currentChapter 为 null 且 loading=false 时显示"章节未找到" -->
    <!-- 触发场景：loadChapter 返回 null（slug 无效 / API 异常，仓库层 catch 降级返回 null） -->
    <section v-else-if="!loading" class="chapter-detail__empty">
      <div class="container text-center">
        <h2>章节未找到</h2>
        <!-- 返回按钮：跳转回课程中心 /course -->
        <NuxtLink to="/course" class="chapter-detail__back">返回课程中心</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 来源：~/repositories/LessonRepository.ts（项目自定义仓储模块）
// 用途：Lesson 类型导入（type-only import，编译后擦除），用于 computed<Lesson[]> 的泛型参数
//       描述单个课时的数据结构，字段如下：
//         slug: string          课时 URL 友好标识，用于路由路径 /course/:chapter/:lesson
//         title: string         课时标题，列表项主文本显示
//         description: string   课时描述，列表项副文本显示
//         order?: number        课时排序序号（可选）
//         body?: unknown        课时正文内容块（可选，用于详情页）
//         _path?: string        Nuxt Content 自动生成路径（可选）
//         [key: string]: unknown  可扩展字段
import type { Lesson } from '~/repositories/LessonRepository'
// 来源：nuxt/app（Nuxt 框架内置模块）
// 用途：
//   - useHead：声明式设置文档头部 meta 信息（本页用于动态响应式页面标题）
//   - useRoute：获取当前路由实例（本页用于读取 route.params.chapter 动态参数）
import { useHead, useRoute } from 'nuxt/app'
// 来源：~/composables/useChapter.ts（项目自定义 composable 模块）
// 用途：useChapter 封装章节响应式状态（chapters/currentChapter/loading）
//       及异步加载方法（loadChapters/loadChapter），内部通过 ChapterRepository 与后端交互
import { useChapter } from '~/composables/useChapter'
// 来源：vue（Vue 3 官方库）
// 用途：computed Vue 3 响应式 API，创建派生计算属性
//       本页两处使用：useHead 的 title 字段、lessons 课时列表派生
import { computed } from 'vue'

// useRoute() 调用：获取当前路由实例对象（RouteLocationNormalizedLoaded）
// 后续用于读取动态路由参数 route.params.chapter
const route = useRoute()
// 从 route.params.chapter 提取章节 slug 字符串，兼容数组和字符串两种情况
// 路由参数来源：Nuxt 文件路由约定，文件名 [chapter].vue 自动注册动态路由段，URL 中 /course/xxx 的 xxx 被解析为 params.chapter
// 为何可能是数组：当多层嵌套动态路由或使用可选参数时，Nuxt 可能将同名参数收集为数组，此处做防御式归一化
//   - 若为数组：取第一个元素 route.params.chapter[0]（string）
//   - 若为字符串：直接使用 route.params.chapter（string | string[] → string）
// chapterSlug 用途：① 作为 loadChapter 参数 ② 拼接到 NuxtLink :to 路径
const chapterSlug = Array.isArray(route.params.chapter)
  ? route.params.chapter[0]
  : route.params.chapter

// useHead 调用：声明式设置当前页面浏览器标签页标题（响应式，随 currentChapter 变化自动更新）
// 传递参数值：{ title: ComputedRef<string> } —— title 为 computed 包装的响应式字符串
// title computed 逻辑 & 返回类型：
//   逻辑：currentChapter.value 非空（即 Chapter 对象）时，拼接模板字符串 `${currentChapter.value.title} · 章节`
//         否则返回默认值 "章节"（章节尚未加载或加载失败时的兜底）
//   返回类型：ComputedRef<string>，通过 .value 获取最终字符串
// 调用流程：Vue/Nuxt 运行时自动订阅 currentChapter 依赖，变化时重算 title 并同步到 document.title
useHead({
  title: computed(() => (currentChapter.value ? `${currentChapter.value.title} · 章节` : '章节')),
})

// useChapter() composable 调用：解构获取章节详情页所需的三个公开 API
// 调用流程：
//   1. 进入 useChapter 函数作用域，创建三个 ref（chapters=[]、currentChapter=null、loading=false）
//   2. 定义 loadChapters / loadChapter 两个闭包函数，持有上述 ref 的引用
//   3. 返回包含 5 个属性的对象 { chapters, currentChapter, loading, loadChapters, loadChapter }
//   4. 当前页仅解构需要的 3 个：currentChapter（章节详情）、loading（加载状态）、loadChapter（单章加载方法）
// 返回值字段：
//   - currentChapter: Ref<Chapter | null>，响应式引用，初始 null，加载成功后为 Chapter 对象：
//       id: string                章节唯一主键
//       slug: string              章节 URL 标识（与 chapterSlug 匹配）
//       title: string             章节标题，面包屑当前项 / h1 显示
//       description?: string      章节描述（可选），h1 下方描述显示
//       order: number             章节排序序号
//       lessons: unknown[]        课时原始数组（computed lessons 从这里派生，强转 Lesson[]）
//       exercise?: unknown | null 关联练习数据（可选，本页不直接使用）
//       [key: string]: unknown    可扩展字段
//   - loading: Ref<boolean>，加载状态标志，UI 使用方式：
//       loading=true  → 主内容区课时列表显示"加载中..."占位文案（template 第43行）
//                       同时"章节未找到"分支被 v-else-if="!loading" 跳过
//       loading=false → 课时列表区域根据 lessons.length 显示列表或空状态（第46/74行）
//                       同时若 currentChapter 仍为 null，则命中"章节未找到"分支（第101行）
//   - loadChapter: (slug: string) => Promise<void>，异步加载单章详情的函数
const { currentChapter, loading, loadChapter } = useChapter()

// loadChapter(chapterSlug) 调用：条件性触发章节详情加载（顶层 await，SSR 阻塞等待）
// 触发条件：chapterSlug 为 truthy（非空字符串），避免路由参数异常时发出无效请求
// 传递参数值：chapterSlug（从 route.params.chapter 归一化得到的字符串，如 "algebra-basics"）
// 内部调用链：
//   loadChapter(slug)（composable）
//     → ChapterRepository.findBySlug(slug)（仓库层）
//       → $fetch<Chapter>(`/api/chapter/${slug}`)（Nuxt HTTP）
//         → 最终打到后端 server endpoint: GET /api/chapter/:slug（slug 为路径参数，无 query 参数）
// 副作用：成功时赋值 currentChapter.value = Chapter 对象，失败时 = null（仓库层 catch 降级）
//         loading.value 请求前设 true，请求结束（finally）设 false，驱动 UI 三态切换
if (chapterSlug) await loadChapter(chapterSlug)

// lessons computed：从 currentChapter 派生课时列表，保证类型安全的 Lesson[] 返回
// 声明泛型：computed<Lesson[]> —— 明确返回的计算属性包装值类型为 Lesson[]
// 派生逻辑 & 返回类型：
//   逻辑：
//     1. 暂存 currentChapter.value 到局部变量 ch（避免多次 .value 访问）
//     2. 条件判断：ch 非空（truthy）且 (ch as any).lessons 是数组 → 将 lessons 强转为 Lesson[] 返回
//     3. 否则（章节未加载 / lessons 非数组）→ 返回空数组 [] 兜底
//   返回类型：ComputedRef<Lesson[]> —— 通过 .value 访问最终 Lesson[]，在 template 中自动解包
// 模板使用位置：v-else-if="lessons.length" 判断非空、v-for="(lesson, idx) in lessons" 遍历渲染
const lessons = computed<Lesson[]>(() => {
  const ch = currentChapter.value
  return ch && Array.isArray((ch as any).lessons) ? (ch as any).lessons as Lesson[] : []
})
</script>

<style scoped>
.chapter-detail__header {
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.chapter-detail__breadcrumb {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}
.chapter-detail__bc-link { color: var(--color-text-secondary); text-decoration: none; }
.chapter-detail__bc-link:hover { color: var(--color-primary); }
.chapter-detail__bc-sep { color: var(--color-text-light); }
.chapter-detail__bc-current { color: var(--color-text-primary); font-weight: 500; }
.chapter-detail__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.chapter-detail__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 640px;
  line-height: 1.6;
  margin: 0;
}
.chapter-detail__body { padding: var(--spacing-xl) 0 var(--spacing-3xl); }
.chapter-detail__layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--spacing-xl);
  align-items: start;
}
.chapter-detail__main { min-width: 0; }
.chapter-detail__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}
.lesson-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-sm); }
.lesson-list__link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.lesson-list__link:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
.lesson-list__index {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-primary);
  min-width: 2.25rem;
}
.lesson-list__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.lesson-list__title { font-weight: 600; color: var(--color-text-primary); }
.lesson-list__desc { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.5; }
.lesson-list__arrow { color: var(--color-text-light); font-weight: 500; transition: transform 150ms ease; }
.lesson-list__link:hover .lesson-list__arrow { color: var(--color-primary); transform: translateX(4px); }
.exercise-card {
  display: block;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  position: sticky;
  top: 80px;
}
.exercise-card__icon { font-size: 1.5rem; margin-bottom: var(--spacing-sm); }
.exercise-card__title { font-size: 1.125rem; font-weight: 600; margin: 0 0 4px; color: #fff; }
.exercise-card__desc { font-size: 0.875rem; opacity: 0.85; margin: 0 0 var(--spacing-lg); }
.exercise-card__cta { display: inline-block; font-size: 0.875rem; font-weight: 500; }
.chapter-detail__empty {
  padding: var(--spacing-3xl) 0;
  color: var(--color-text-muted);
}
.chapter-detail__back {
  display: inline-block;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
}
@media (max-width: 900px) {
  .chapter-detail__layout { grid-template-columns: 1fr; }
  .exercise-card { position: static; }
}
</style>
