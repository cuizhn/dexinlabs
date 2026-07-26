<template>
  <div class="bg-bg-white border border-border rounded-lg p-6">
    <h3 class="flex items-center gap-2 text-[0.9375rem] font-semibold text-text-primary mb-4">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="text-primary flex-shrink-0">
        <path d="M3 9l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      今天需要解决的问题
    </h3>

    <ul class="list-none p-0 mb-4 flex flex-col gap-2">
      <li
        v-for="(item, idx) in checklistItems"
        :key="idx"
        class="flex items-center gap-2 px-3 py-2 rounded-sm bg-bg-secondary text-sm text-text-primary transition-all duration-150"
        :class="{ 'bg-[rgba(34,197,94,0.08)] text-text-secondary': item.done }"
      >
        <span
          class="w-[18px] h-[18px] border-2 border-border rounded-[4px] flex items-center justify-center text-[0.75rem] font-bold text-[#16a34a] flex-shrink-0"
          :class="{ 'border-[#16a34a] bg-[rgba(34,197,94,0.1)]': item.done }"
        >
          <template v-if="item.done">✓</template>
        </span>
        <span class="flex-1" :class="{ 'line-through': item.done }">{{ item.text }}</span>
      </li>
    </ul>

    <div class="border-t border-border pt-3">
      <span class="block text-[0.75rem] text-text-light mb-[6px]">
        学习进度 {{ completedCount }} / {{ checklistItems.length }}
      </span>
      <div class="h-[4px] bg-bg-secondary rounded-[2px] overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary to-secondary rounded-[2px] transition-all duration-500"
          :style="{ width: `${(completedCount / checklistItems.length) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChecklistItem {
  text: string
  done: boolean
}

const props = defineProps<{
  items?: ChecklistItem[]
}>()

const defaultItems: ChecklistItem[] = [
  { text: '理解核心概念的定义', done: false },
  { text: '掌握基本公式的推导', done: false },
  { text: '能够应用到实际问题中', done: false }
]

const checklistItems = computed(() => props.items ?? defaultItems)

const completedCount = computed(() => checklistItems.value.filter(item => item.done).length)
</script>
