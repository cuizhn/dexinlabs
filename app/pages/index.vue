<template>
  <div class="learning-home">
    <div class="learning-home__bg">
      <div class="learning-home__grid"></div>
      <div class="learning-home__glow"></div>
    </div>

    <main class="learning-home__main">
      <div class="container learning-home__container">
        <template v-if="isFirstVisit">
          <div class="learning-home__first-run">
            <div class="learning-home__logo">
              <span class="learning-home__logo-icon">∑</span>
              <span class="learning-home__logo-text">Dexin Labs</span>
            </div>

            <h1 class="learning-home__title">开始你的学习之旅</h1>

            <p class="learning-home__subtitle">从「一元二次方程」开始<br />这是初中数学的核心主题之一</p>

            <div class="learning-home__actions">
              <NuxtLink to="/algebra/quadratic-equation-in-one-unknown" class="learning-home__btn learning-home__btn--primary">
                开始学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </div>

            <NuxtLink to="/map" class="learning-home__explore">
              或者，先探索知识体系 →
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <div class="learning-home__returning">
            <div class="learning-home__logo">
              <span class="learning-home__logo-icon">∑</span>
              <span class="learning-home__logo-text">Dexin Labs</span>
            </div>

            <div v-if="lastLesson" class="learning-home__continue-card">
              <h2 class="learning-home__continue-label">继续学习</h2>

              <div class="learning-home__continue-info">
                <span class="learning-home__continue-topic">{{ lastLesson.topicTitle }}</span>
                <span class="learning-home__continue-lesson">第 {{ lastLesson.lessonIndex }} 课 · {{ lastLesson.lessonTitle }}</span>
              </div>

              <div class="learning-home__continue-progress">
                <span class="learning-home__progress-text">{{ lastLesson.lessonIndex }} / {{ lastLesson.totalLessons }}</span>
                <div class="learning-home__progress-bar">
                  <div class="learning-home__progress-fill" :style="{ width: `${(lastLesson.lessonIndex / lastLesson.totalLessons) * 100}%` }"></div>
                </div>
              </div>

              <NuxtLink :to="`/${lastLesson.topicSlug}/${lastLesson.lessonSlug}`" class="learning-home__btn learning-home__btn--primary learning-home__btn--lg">
                继续学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </div>

            <div v-else class="learning-home__no-progress">
              <h2 class="learning-home__title">继续学习</h2>
              <p class="learning-home__subtitle">还没有学习记录<br />选择一个主题开始学习</p>
              <NuxtLink to="/map" class="learning-home__btn learning-home__btn--primary">
                探索知识地图
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </div>

            <NuxtLink to="/map" class="learning-home__explore">
              探索知识 →
            </NuxtLink>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { isFirstVisit, lastLesson } = useProgress()

useHead({
  title: 'Dexin Labs · 学习首页'
})
</script>

<style scoped>
.learning-home {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.learning-home__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.learning-home__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(79, 70, 229, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 70, 229, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

.learning-home__glow {
  position: absolute;
  width: 600px;
  height: 600px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, transparent 70%);
  filter: blur(100px);
}

.learning-home__main {
  position: relative;
  z-index: 2;
  padding: var(--spacing-2xl) var(--spacing-lg);
  width: 100%;
}

.learning-home__container {
  max-width: 520px;
  margin: 0 auto;
  text-align: center;
}

.learning-home__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--spacing-2xl);
}

.learning-home__logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--border-radius-md);
  color: #fff;
  font-weight: 700;
  font-size: 1.125rem;
}

.learning-home__logo-text {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-text-primary);
}

.learning-home__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.15;
  margin: 0 0 var(--spacing-md);
}

.learning-home__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin: 0 0 var(--spacing-xl);
}

.learning-home__actions {
  display: flex;
  justify-content: center;
}

.learning-home__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: all 0.25s ease;
}

.learning-home__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.learning-home__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.learning-home__btn--lg {
  width: 100%;
  justify-content: center;
  padding: 16px 32px;
  font-size: 1rem;
}

.learning-home__explore {
  display: inline-block;
  margin-top: var(--spacing-xl);
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 150ms ease;
}

.learning-home__explore:hover {
  color: var(--color-primary);
}

.learning-home__continue-card {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.learning-home__continue-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--spacing-md);
}

.learning-home__continue-info {
  margin-bottom: var(--spacing-lg);
}

.learning-home__continue-topic {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.learning-home__continue-lesson {
  display: block;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.learning-home__continue-progress {
  margin-bottom: var(--spacing-xl);
}

.learning-home__progress-text {
  display: block;
  font-size: 0.8125rem;
  color: var(--color-text-light);
  margin-bottom: 8px;
}

.learning-home__progress-bar {
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.learning-home__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.learning-home__no-progress {
  padding: var(--spacing-2xl) 0;
}

@media (max-width: 768px) {
  .learning-home__title {
    font-size: 1.875rem;
  }

  .learning-home__subtitle {
    font-size: 1rem;
  }

  .learning-home__btn {
    padding: 12px 24px;
    font-size: 0.875rem;
  }

  .learning-home__continue-card {
    padding: var(--spacing-xl);
  }

  .learning-home__continue-topic {
    font-size: 1.25rem;
  }
}
</style>