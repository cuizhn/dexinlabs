<template>
  <div class="min-h-screen relative flex items-center justify-center">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0" style="background-image: linear-gradient(rgba(79, 70, 229, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.03) 1px, transparent 1px); background-size: 60px 60px;"></div>
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.06)_0%,transparent_70%)] blur-[100px]"></div>
    </div>

    <main class="relative z-2 px-8 py-12 w-full">
      <div class="max-w-[520px] mx-auto text-center">
        <!-- 状态一：首次进入 - 开始学习 -->
        <template v-if="!hasProgress">
          <div>
            <div class="inline-flex items-center gap-[10px] mb-8">
              <span class="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-md text-white font-bold text-lg">∑</span>
              <span class="font-bold text-lg text-text-primary">Dexin Labs</span>
            </div>

            <h1 class="text-[2.5rem] font-extrabold text-text-primary leading-[1.15] mb-4 md:text-[1.875rem]">开始你的学习之旅</h1>

            <p class="text-lg text-text-secondary leading-[1.75] mb-8 md:text-base">
              选择你的学习阶段<br />我们将为你推荐最适合的学习内容
            </p>

            <div class="flex justify-center">
              <button class="inline-flex items-center gap-2 px-8 py-[14px] rounded-md font-semibold text-[0.9375rem] bg-gradient-to-br from-primary to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)] md:px-6 md:py-3 md:text-sm" @click="showStageDialog = true">
                开始学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <NuxtLink to="/map" class="inline-block mt-8 text-[0.9375rem] text-text-secondary no-underline transition-colors duration-150 hover:text-primary">
              或者，先探索知识体系 →
            </NuxtLink>
          </div>
        </template>

        <!-- 状态二：有学习记录 - 继续学习 -->
        <template v-else>
          <div>
            <div class="inline-flex items-center gap-[10px] mb-8">
              <span class="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-md text-white font-bold text-lg">∑</span>
              <span class="font-bold text-lg text-text-primary">Dexin Labs</span>
            </div>

            <!-- 有学习进度：显示继续学习卡片 -->
            <LearningContinueLearningCard v-if="recentLearning" />

            <!-- 无具体进度但有记录：引导去知识地图 -->
            <div v-else class="py-12">
              <h2 class="text-[2.5rem] font-extrabold text-text-primary leading-[1.15] mb-4 md:text-[1.875rem]">继续学习</h2>
              <p class="text-lg text-text-secondary leading-[1.75] mb-8 md:text-base">
                选择一个主题开始学习
              </p>
              <NuxtLink to="/map" class="inline-flex items-center gap-2 px-8 py-[14px] rounded-md font-semibold text-[0.9375rem] bg-gradient-to-br from-primary to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)] md:px-6 md:py-3 md:text-sm">
                探索知识地图
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </div>

            <NuxtLink to="/map" class="inline-block mt-8 text-[0.9375rem] text-text-secondary no-underline transition-colors duration-150 hover:text-primary">
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
