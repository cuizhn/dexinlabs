<template>
  <section class="py-24 bg-bg-secondary md:py-16">
    <div class="max-w-[1200px] mx-auto px-6 md:px-4">
      <div class="max-w-[480px] mb-12">
        <span class="inline-block px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase text-primary bg-primary-light rounded-full mb-3">核心优势</span>
        <h2 class="text-[2.5rem] font-extrabold text-text-primary leading-[1.15] mb-3 md:text-[1.75rem] xs:text-[1.5rem]">为数学学习<br />量身打造</h2>
        <p class="text-[1.0625rem] text-text-secondary leading-[1.7]">不只是视频和文字，而是真正可交互的学习体验</p>
      </div>

      <div class="grid grid-cols-6 gap-4 lg:grid-cols-2 md:grid-cols-1">
        <div v-for="(feat, i) in features" :key="i" class="card" :class="feat.size === 'lg' ? 'col-span-2 lg:col-span-2 md:col-span-1' : 'col-span-2 lg:col-span-1 md:col-span-1'">
          <div class="w-12 h-12 rounded-md flex items-center justify-center text-[1.375rem] mb-3" :style="{ backgroundColor: feat.bg }">
            <span>{{ feat.icon }}</span>
          </div>
          <h3 class="text-[1.125rem] font-bold text-text-primary mb-2">{{ feat.title }}</h3>
          <p class="text-[0.875rem] text-text-secondary leading-[1.7]">{{ feat.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
// 首页特色功能网格 - 以卡片网格形式展示平台核心优势
const features = [
  {
    icon: '📐',
    title: '数与代数 · 图形与几何 · 统计与概率',
    desc: '从代数几何到概率统计，完整覆盖中学数学知识体系，每个阶段都有清晰的学习目标和路径规划',
    size: 'lg',
    bg: '#EEF2FF'
  },
  {
    icon: '✏️',
    title: '交互式练习',
    desc: '单选题、填空题等多种题型，即时判题反馈，边学边练巩固知识',
    size: 'md',
    bg: '#ECFDF5'
  },
  {
    icon: '📊',
    title: '学习追踪',
    desc: '实时记录学习进度，可视化展示知识掌握程度',
    size: 'md',
    bg: '#FFF7ED'
  },
  {
    icon: '🔬',
    title: '公式渲染',
    desc: 'KaTeX 驱动的数学公式渲染，让复杂的数学表达式清晰呈现',
    size: 'md',
    bg: '#FDF2F8'
  },
  {
    icon: '📱',
    title: '多端适配',
    desc: '响应式设计，手机、平板、电脑随时随地学习',
    size: 'lg',
    bg: '#F0F9FF'
  }
]
</script>
