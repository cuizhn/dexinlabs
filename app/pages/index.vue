<template>
  <div class="learning-home">
    <div class="learning-home__bg">
      <div class="learning-home__grid"></div>
      <div class="learning-home__glow"></div>
    </div>

    <main class="learning-home__main">
      <div class="container learning-home__container">
        <!-- 状态一：首次进入 - 开始学习 -->
        <template v-if="!hasProgress">
          <div class="learning-home__first-run">
            <div class="learning-home__logo">
              <span class="learning-home__logo-icon">∑</span>
              <span class="learning-home__logo-text">Dexin Labs</span>
            </div>

            <h1 class="learning-home__title">开始你的学习之旅</h1>

            <p class="learning-home__subtitle">
              选择你的学习阶段<br />我们将为你推荐最适合的学习内容
            </p>

            <div class="learning-home__actions">
              <button class="learning-home__btn learning-home__btn--primary" @click="showStageDialog = true">
                开始学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <NuxtLink to="/map" class="learning-home__explore">
              或者，先探索知识体系 →
            </NuxtLink>
          </div>
        </template>

        <!-- 状态二：有学习记录 - 继续学习 -->
        <template v-else>
          <div class="learning-home__returning">
            <div class="learning-home__logo">
              <span class="learning-home__logo-icon">∑</span>
              <span class="learning-home__logo-text">Dexin Labs</span>
            </div>

            <!-- 有学习进度：显示继续学习卡片 -->
            <LearningContinueLearningCard v-if="recentLearning" />

            <!-- 无具体进度但有记录：引导去知识地图 -->
            <div v-else class="learning-home__no-progress">
              <h2 class="learning-home__title">继续学习</h2>
              <p class="learning-home__subtitle">
                选择一个主题开始学习
              </p>
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

    <!-- 学习阶段选择弹窗（首次进入时显示） -->
    <LearningLearningStageDialog
      v-if="showStageDialog"
      @close="showStageDialog = false"
      @select="onStageSelect"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 首页 - 学习入口
 *
 * 根据是否存在学习记录，自动进入「开始学习」或「继续学习」模式。
 * 学习状态统一由 useLearningState() 提供，不直接读取业务数据。
 *
 * 首次进入：显示学习阶段选择 → 诊断问题（占位） → 推荐 Topic
 * 有学习记录：显示继续学习卡片 → 直接进入当前学习位置
 */
import { useLearningState } from '~/composables/useLearningState'

const { hasProgress, recentLearning } = useLearningState()

/** 是否显示学习阶段选择弹窗 */
const showStageDialog = ref(false)

/**
 * onStageSelect - 用户选择学习阶段后的处理
 *
 * 当前为占位实现：直接跳转到推荐 Topic。
 * 未来接入诊断系统后，会根据阶段选择展示诊断问题，
 * 然后根据诊断结果推荐合适的 Topic。
 */
function onStageSelect(_stage: string) {
  showStageDialog.value = false
  // 占位：跳转到推荐 Topic（当前硬编码为第一个代数主题）
  // 未来由 Recommendation Engine 根据诊断结果决定
  navigateTo('/algebra/quadratic-equation-in-one-unknown')
}

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
  border: none;
  cursor: pointer;
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
}
</style>
