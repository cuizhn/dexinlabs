<template>
  <NuxtLink to="/course" class="course-card">
    <div class="course-card__body">
      <h3 class="course-card__title">{{ course?.title ?? '课程标题' }}</h3>

      <p class="course-card__desc">{{ course?.description ?? '课程描述' }}</p>
    </div>

    <div class="course-card__meta">
      <span class="course-card__chapters">{{ course?.chapters ?? 0 }} 章节</span>

      <span
        v-if="course?.difficulty"
        class="course-card__difficulty"
        :class="`course-card__difficulty--${course.difficulty}`"
      >
        {{ difficultyLabel }}
      </span>
    </div>

    <div class="course-card__arrow">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 10h12M12 6l4 4-4 4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  course: { type: Object, required: false }
})

const difficultyLabel = computed(() => {
  switch (props.course?.difficulty) {
    case 'beginner':
      return '入门'
    case 'intermediate':
      return '进阶'
    case 'advanced':
      return '高级'
    default:
      return ''
  }
})
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

.course-card__icon--beginner {
  background: linear-gradient(135deg, #10b981, #059669);
}
.course-card__icon--intermediate {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.course-card__icon--advanced {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

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
  background-color: #ecfdf5;
  color: #059669;
}

.course-card__difficulty--intermediate {
  background-color: #fff7ed;
  color: #d97706;
}

.course-card__difficulty--advanced {
  background-color: #eef2ff;
  color: #6366f1;
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

@markdowndia (max-width: 768px) {
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
