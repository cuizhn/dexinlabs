<template>
  <!-- 学习阶段选择弹窗 - 首次进入时让用户选择学习阶段 -->
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-200 p-6" @click.self="$emit('close')">
    <div class="bg-bg-white rounded-xl p-8 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      <div class="text-center mb-6">
        <h2 class="text-[1.5rem] font-bold text-text-primary m-0 mb-2">选择你的学习阶段</h2>
        <p class="text-[0.9375rem] text-text-secondary m-0">
          我们会根据你的阶段推荐合适的学习内容
        </p>
      </div>

      <div class="flex flex-col gap-3 mb-6">
        <button
          v-for="stage in stages"
          :key="stage.value"
          class="flex items-center gap-4 p-4 border border-border rounded-lg bg-bg-white cursor-pointer text-left transition-all duration-150 hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-sm"
          @click="$emit('select', stage.value)"
        >
          <span class="text-[1.75rem] flex-shrink-0">{{ stage.icon }}</span>
          <div class="flex flex-col gap-[2px]">
            <span class="text-base font-semibold text-text-primary">{{ stage.label }}</span>
            <span class="text-[0.8125rem] text-text-secondary">{{ stage.desc }}</span>
          </div>
        </button>
      </div>

      <button class="block w-full py-2 border-none bg-none text-text-light text-[0.875rem] cursor-pointer transition-colors duration-150 hover:text-text-secondary" @click="$emit('close')">
        稍后再说
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LearningStageDialog - 学习阶段选择弹窗
 *
 * 首次进入首页时显示，让用户选择当前学习阶段。
 * 选择后进入诊断问题流程（当前为占位），最终推荐合适的 Topic。
 *
 * 当前为 Mock 实现，未来接入诊断系统后：
 * 1. 根据阶段拉取对应的 3-5 个诊断问题
 * 2. 用户作答后生成初步诊断信息
 * 3. 存储诊断结果用于推荐
 */

defineEmits<{
  /** 关闭弹窗 */
  (e: 'close'): void
  /** 选择了学习阶段 */
  (e: 'select', stage: string): void
}>()

/** 学习阶段选项（Mock 数据） */
const stages = [
  {
    value: 'elementary',
    icon: '🌱',
    label: '小学阶段',
    desc: '基础运算、简单几何、初步统计'
  },
  {
    value: 'junior-high',
    icon: '🌿',
    label: '初中阶段',
    desc: '方程、函数、几何证明、概率统计'
  },
  {
    value: 'senior-high',
    icon: '🌳',
    label: '高中阶段',
    desc: '高等代数、解析几何、微积分初步'
  }
]
</script>
