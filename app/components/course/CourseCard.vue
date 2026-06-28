<!--
  ============================================================
  【自动注册名】<CourseCard>
    注册原理：nuxt.config.ts 配置 srcDir = 'app/' 且 components.dirs = '~/components'
    Nuxt 自动扫描 app/components/**/*.vue，按目录路径+文件名 PascalCase 转换
    本文件路径：app/components/course/CourseCard.vue → 注册名：CourseCard
  ============================================================
  【Props 概览】
    course   字段名：course   类型：CourseCardData | undefined   必填：否   默认值：undefined
      子字段：
        title?       string        课程标题（空值兜底显示"课程标题"）
        description? string        课程描述（空值兜底显示"课程描述"）
        chapters?    number        章节数量（空值兜底显示 0）
        difficulty?  Difficulty    难度枚举 'beginner' | 'intermediate' | 'advanced'
  ============================================================
  【Emit 事件】无（组件未调用 defineEmits，通过根 NuxtLink 直接跳转 /course，不触发父组件事件）
  ============================================================
  【引用方搜索结果】
    ① docs/README.md:81 — 架构文档中列出组件位置说明
    ② docs/README.md:620 — 组件命名约定示例（PascalCase 规则说明）
    ③ 实际页面引用：暂未搜索到 <CourseCard 标签调用（首页当前使用内联 landing__course 样式，待重构为此组件）
    预期使用方：首页 /pages/index.vue 的课程体系区域、课程中心 /pages/course/index.vue 列表
  ============================================================
  【数据流向】
    父组件 → props(course: CourseCardData) → CourseCard
      ↑                                        ↓
      │                                  NuxtLink 跳转 /course
      │                                  点击整个卡片即触发导航
      │
      数据来源：useCourse composable 的 getAllCourses() 返回 CourseListItem[]
               由父组件遍历数组，每项传入一个 <CourseCard :course="item" />
  ============================================================
  CourseCard 组件 - 课程卡片
  功能说明：
  - 以卡片形式展示课程概要信息，点击跳转到课程中心
  - 展示课程标题、描述、章节数和难度标签（入门/进阶/高级）
  - 悬停时有上浮动画和渐变遮罩效果
  - 移动端（≤768px）切换为垂直布局
-->
<template>
  <!-- 课程卡片根容器：使用 NuxtLink 作为根元素，点击整个卡片即跳转至 /course 课程中心页 -->
  <!-- class="course-card"：承载卡片外观样式（白底、圆角、边框、悬停上浮动画、::after 渐变遮罩层） -->
  <NuxtLink to="/course" class="course-card">
    <!-- 卡片主体内容区：flex:1 占据剩余空间，垂直排列课程标题 + 描述 -->
    <!-- z-index:1 保证内容层位于 ::after 渐变遮罩层之上（不被遮罩覆盖文本） -->
    <div class="course-card__body">
      <!-- 课程标题 h3：使用可选链 + 空值合并运算符兜底 -->
      <!-- course?.title → props.course 为 undefined/null 时短路返回 undefined -->
      <!-- ?? '课程标题' → undefined/null 时显示兜底文案"课程标题"，避免页面空白 -->
      <h3 class="course-card__title">{{ course?.title ?? '课程标题' }}</h3>
      <!-- 课程描述段落 p：同样使用 ?? 运算符兜底，-webkit-line-clamp:2 限制显示两行，超出省略号 -->
      <p class="course-card__desc">{{ course?.description ?? '课程描述' }}</p>
    </div>
    <!-- 卡片元信息区：flex-shrink:0 不被压缩，右对齐垂直排列章节数 + 难度标签 -->
    <div class="course-card__meta">
      <!-- 章节数量展示：course?.chapters 为空时兜底显示 0，后接固定文案"章节" -->
      <span class="course-card__chapters">{{ course?.chapters ?? 0 }} 章节</span>
      <!-- 难度标签：仅当 props.course.difficulty 存在（非 undefined/null）时渲染 -->
      <!-- 动态 class 绑定：根据难度值追加修饰符类（beginner/intermediate/advanced）控制背景色和文字色 -->
      <span
        v-if="course?.difficulty"
        class="course-card__difficulty"
        :class="`course-card__difficulty--${course.difficulty}`"
      >
        <!-- 难度中文标签：由 script 中 computed(difficultyLabel) 转换难度枚举值为中文 -->
        <!-- 'beginner'→'入门' / 'intermediate'→'进阶' / 'advanced'→'高级' / 其他→'' -->
        {{ difficultyLabel }}
      </span>
    </div>
    <!-- 卡片右侧箭头图标：纯装饰性 CTA 指示，悬停时主色高亮 + 向右 translateX(4px) 动画 -->
    <!-- z-index:1 保证位于 ::after 遮罩层之上，不被渐变遮罩覆盖 -->
    <div class="course-card__arrow">
      <!-- SVG 右箭头：stroke="currentColor" 继承文本颜色，与悬停状态联动变色 -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
// ============================================================
// 【组件声明】Vue 3 <script setup> 语法糖
// 组件名自动推导：从文件名 CourseCard.vue 推导为 PascalCase "CourseCard"
// Nuxt 全局注册：配合 nuxt.config.ts 的 components.dirs 配置，无需手动 import
// ============================================================

/**
 * 课程卡片组件：展示课程概要信息
 * @component CourseCard
 */

// ============================================================
// 【外部依赖 import】
// computed: Vue 3 组合式 API，用于创建派生响应式状态
// 本文件中用于将难度枚举值 'beginner' 等映射为中文展示标签
// ============================================================
import { computed } from 'vue'

// ============================================================
// 【类型定义 Difficulty】难度等级联合类型（字符串字面量类型）
// 取值范围仅允许三个离散值，其他字符串在 TypeScript 编译阶段报错
//   'beginner'     — 入门级，对应绿色标签样式 course-card__difficulty--beginner
//   'intermediate' — 进阶级，对应橙色标签样式 course-card__difficulty--intermediate
//   'advanced'     — 高级级，对应紫色标签样式 course-card__difficulty--advanced
// ============================================================
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

// ============================================================
// 【接口定义 CourseCardData】课程卡片数据结构
// 所有字段均为可选（?），因为 template 使用 ?? 做了空值兜底，允许传入空对象
//   title?: string       — 课程标题（可为空）
//   description?: string — 课程描述简介（可为空）
//   chapters?: number    — 章节数量（可为空）
//   difficulty?: Difficulty — 难度枚举（可为空，为空则不显示难度标签）
// ============================================================
interface CourseCardData {
  title?: string
  description?: string
  chapters?: number
  difficulty?: Difficulty
}

// ============================================================
// 【Props 声明】使用泛型 defineProps<T>() 语法
// 解构赋值给 props 变量，因为 computed(difficultyLabel) 内部需要访问 props.course
// ----------
// 字段 course：
//   字段名：course
//   类型：CourseCardData | undefined
//   必填：否（? 可选修饰符）
//   默认值：undefined（未传入时的值，template 使用 ?? 运算符兜底展示）
//   子字段说明：参见上方 CourseCardData 接口定义
// ============================================================
const props = defineProps<{
  course?: CourseCardData
}>()

// ============================================================
// 【计算属性 difficultyLabel】难度枚举值 → 中文展示文案的映射
// 依赖项：props.course?.difficulty（当 course 对象或 difficulty 变化时自动重算）
// 返回值类型：string（中文标签或空字符串）
// Switch 分支逻辑：
//   'beginner'     → 中文 '入门'
//   'intermediate' → 中文 '进阶'
//   'advanced'     → 中文 '高级'
//   其他值（含 undefined/null） → 空字符串 ''，保证 template 中 v-if 分支不渲染
// ============================================================
const difficultyLabel = computed(() => {
  switch (props.course?.difficulty) {
    case 'beginner': return '入门'
    case 'intermediate': return '进阶'
    case 'advanced': return '高级'
    default: return ''
  }
})
// ============================================================
// 【Emit 声明】本组件未调用 defineEmits()，无自定义事件
// 交互方式：根元素 NuxtLink 直接跳转 /course，不经过父组件
// ============================================================
</script>

<style scoped>
.course-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.course-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.02), rgba(6, 182, 212, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.course-card:hover::after {
  opacity: 1;
}

.course-card__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.course-card__icon--beginner { background: linear-gradient(135deg, #10B981, #059669); }
.course-card__icon--intermediate { background: linear-gradient(135deg, #F59E0B, #D97706); }
.course-card__icon--advanced { background: linear-gradient(135deg, #8B5CF6, #6366F1); }

.course-card__body {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.course-card__title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.course-card__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.course-card__chapters {
  font-size: var(--text-xs);
  color: var(--color-text-light);
}

.course-card__difficulty {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.course-card__difficulty--beginner {
  background-color: #ECFDF5;
  color: #059669;
}

.course-card__difficulty--intermediate {
  background-color: #FFF7ED;
  color: #D97706;
}

.course-card__difficulty--advanced {
  background-color: #EEF2FF;
  color: #6366F1;
}

.course-card__arrow {
  position: relative;
  z-index: 1;
  color: var(--color-text-light);
  transition: all 0.25s ease;
}

.course-card:hover .course-card__arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .course-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .course-card__meta {
    flex-direction: row;
    align-items: center;
  }

  .course-card__arrow {
    display: none;
  }
}
</style>
