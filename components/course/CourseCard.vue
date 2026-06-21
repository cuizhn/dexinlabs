<!--
  CourseCard 组件 - 课程卡片
  功能说明：
  - 以卡片形式展示课程概要信息，点击跳转到课程详情页
  - 展示课程图标（根据难度显示不同颜色）、标题、描述
  - 展示课程章节数和难度标签（入门/进阶/高级）
  - 悬停时有上浮动画和渐变遮罩效果
  - 移动端（≤768px）切换为垂直布局
-->
<template>
  <!-- 课程卡片：整体可点击，跳转到课程详情页 -->
  <NuxtLink :to="`/courses/${course.id}`" class="course-card">
    <!-- 课程图标：根据难度等级显示不同渐变背景色 -->
    <div class="course-card__icon" :class="`course-card__icon--${course.difficulty}`">
      {{ course.icon }}
    </div>
    <!-- 课程主体信息：标题和描述 -->
    <div class="course-card__body">
      <h3 class="course-card__title">{{ course.title }}</h3>
      <p class="course-card__desc">{{ course.description }}</p>
    </div>
    <!-- 课程元信息：章节数和难度标签 -->
    <div class="course-card__meta">
      <span class="course-card__chapters">{{ course.chapterCount }} 章节</span>
      <span class="course-card__difficulty" :class="`course-card__difficulty--${course.difficulty}`">
        {{ difficultyLabel(course.difficulty) }}
      </span>
    </div>
    <!-- 右侧箭头图标：悬停时向右平移 -->
    <div class="course-card__arrow">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
  </NuxtLink>
</template>

<script setup>
/**
 * 课程卡片组件：展示课程概要信息
 * @component CourseCard
 */

const props = defineProps({
  /** 课程数据对象，包含 id、icon、title、description、difficulty、chapters 等字段 */
  course: {
    type: Object,
    required: true,
  },
})

/**
 * 将难度英文标识转换为中文标签
 * @param {string} d - 难度英文标识（beginner / intermediate / advanced）
 * @returns {string} 对应的中文标签
 */
function difficultyLabel(d) {
  const map = { beginner: '入门', intermediate: '进阶', advanced: '高级' }
  return map[d] || d
}
</script>

<style scoped>
/* 课程卡片：水平布局、带边框和圆角、悬停上浮动画 */
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

/* 卡片悬停时的渐变遮罩层 */
.course-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.02), rgba(6, 182, 212, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* 卡片悬停样式：上浮、阴影、主题色边框 */
.course-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

/* 悬停时显示渐变遮罩 */
.course-card:hover::after {
  opacity: 1;
}

/* 课程图标：固定尺寸、圆角、白色文字 */
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

/* 入门难度图标：绿色渐变 */
.course-card__icon--beginner { background: linear-gradient(135deg, #10B981, #059669); }
/* 进阶难度图标：橙色渐变 */
.course-card__icon--intermediate { background: linear-gradient(135deg, #F59E0B, #D97706); }
/* 高级难度图标：紫色渐变 */
.course-card__icon--advanced { background: linear-gradient(135deg, #8B5CF6, #6366F1); }

/* 课程主体信息区域：自适应宽度、文本溢出隐藏 */
.course-card__body {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

/* 课程标题样式 */
.course-card__title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

/* 课程描述样式：最多显示两行，超出省略 */
.course-card__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 课程元信息区域：右对齐、垂直排列 */
.course-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* 章节数文字样式 */
.course-card__chapters {
  font-size: var(--text-xs);
  color: var(--color-text-light);
}

/* 难度标签样式：胶囊形、小字号 */
.course-card__difficulty {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 600;
}

/* 入门难度标签：绿色背景 */
.course-card__difficulty--beginner {
  background-color: #ECFDF5;
  color: #059669;
}

/* 进阶难度标签：橙色背景 */
.course-card__difficulty--intermediate {
  background-color: #FFF7ED;
  color: #D97706;
}

/* 高级难度标签：紫色背景 */
.course-card__difficulty--advanced {
  background-color: #EEF2FF;
  color: #6366F1;
}

/* 右侧箭头图标：悬停时向右平移并变为主题色 */
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

/* 响应式：平板及以下屏幕切换为垂直布局，隐藏箭头 */
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
