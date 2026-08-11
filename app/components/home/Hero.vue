<template>
  <section class="hero">
    <div class="hero__bg">
      <div class="hero__gradient"></div>
      <div class="hero__grid"></div>
    </div>

    <div class="hero__content">
      <div class="hero__logo">
        <span class="hero__logo-icon">∑</span>
        <span class="hero__logo-text">Dexin Labs</span>
      </div>

      <!-- 首次访问 -->
      <template v-if="!hasProgress">
        <h1 class="hero__title">
          开始你的学习之旅
        </h1>
        <p class="hero__subtitle">
          选择学习阶段，我们为你推荐最适合的内容
        </p>
        <div class="hero__actions">
          <button class="hero__btn hero__btn--primary" @click="showStageDialog = true">
            开始学习
            <IconChevron direction="right" :size="16" />
          </button>
        </div>
        <NuxtLink to="/courses" class="hero__explore">
          或者，先探索知识体系 →
        </NuxtLink>
      </template>

      <!-- 回访 -->
      <template v-else>
        <h1 class="hero__title">
          继续学习
        </h1>
        <p class="hero__subtitle">
          上次学习到这里，继续吗？
        </p>
        
        <LearningContinueLearningCard v-if="recentLearning" class="hero__card" />
        
        <div v-else class="hero__actions">
          <NuxtLink to="/courses" class="hero__btn hero__btn--primary">
            探索知识地图
            <IconChevron direction="right" :size="16" />
          </NuxtLink>
        </div>

        <NuxtLink to="/courses" class="hero__explore">
          探索更多 →
        </NuxtLink>
      </template>
    </div>

    <LearningLearningStageDialog
      v-if="showStageDialog"
      @close="showStageDialog = false"
      @select="onStageSelect"
    />
  </section>
</template>

<script setup lang="ts">
const { hasProgress, recentLearning } = useLearningState()
const showStageDialog = ref(false)

function onStageSelect(_stage: string) {
  showStageDialog.value = false
  navigateTo('/courses')
}
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.hero__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--color-primary-ghost) 0%,
    transparent 50%,
    var(--color-primary-ghost-light) 100%
  );
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(var(--color-primary-ghost-strong) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-primary-ghost-strong) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
}

.hero__logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--spacing-2xl);
}

.hero__logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border-radius: var(--border-radius-md);
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.hero__logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.hero__title {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.1;
  margin: 0 0 var(--spacing-md);
  letter-spacing: -0.03em;
}

.hero__subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-xl);
  font-weight: 400;
}

.hero__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 36px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.hero__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
}

.hero__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.hero__explore {
  display: inline-block;
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.hero__explore:hover {
  color: var(--color-primary);
}

.hero__card {
  margin: var(--spacing-xl) 0;
}

@media (max-width: 768px) {
  .hero__title {
    font-size: 2.5rem;
  }

  .hero__subtitle {
    font-size: 1.125rem;
  }

  .hero__btn {
    padding: 14px 28px;
    font-size: 0.9375rem;
  }
}

@media (max-width: 480px) {
  .hero__title {
    font-size: 2rem;
  }

  .hero__subtitle {
    font-size: 1rem;
  }
}
</style>
