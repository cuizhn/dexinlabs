<template>
  <div class="bg-bg-white border border-border rounded-lg p-6">
    <h3 class="flex items-center gap-2 text-[0.9375rem] font-semibold text-text-primary mb-4 pb-3 border-b border-border">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="text-primary flex-shrink-0">
        <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2" />
        <path d="M9 6v3M9 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      学习助手
    </h3>

    <div class="mb-4 last:mb-0">
      <h4 class="text-[0.8125rem] font-semibold text-text-secondary uppercase tracking-[0.04em] mb-2">学习提示</h4>
      <p class="text-sm text-text-primary leading-[1.6] m-0 p-3 bg-[rgba(79,70,229,0.04)] rounded-sm border-l-3 border-primary">
        {{ currentTip }}
      </p>
    </div>

    <div class="mb-4 last:mb-0">
      <h4 class="text-[0.8125rem] font-semibold text-text-secondary uppercase tracking-[0.04em] mb-2">相关知识</h4>
      <ul class="list-none p-0 m-0 flex flex-col gap-1">
        <li v-for="(item, idx) in relatedTopics" :key="idx" class="text-[0.8125rem] text-text-secondary py-1 leading-[1.5] before:content-['·'] before:mr-[6px] before:text-primary before:font-bold">
          {{ item }}
        </li>
      </ul>
    </div>

    <div class="mb-4 last:mb-0 opacity-60">
      <h4 class="text-[0.8125rem] font-semibold text-text-secondary uppercase tracking-[0.04em] mb-2">诊断提醒</h4>
      <p class="text-[0.8125rem] text-text-light leading-[1.6] m-0 italic">
        完成更多课时后，这里会显示针对性的学习建议。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentTip = '阅读时注意区分「定义」和「性质」，它们是不同的概念层次。'

const relatedTopics = [
  '前置知识：一元一次方程',
  '关联概念：判别式与根的关系',
  '后续内容：二次函数的应用'
]
</script>
