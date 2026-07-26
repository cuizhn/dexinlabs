<template>
  <!-- 我的理解 - Lesson 页面右下角的笔记区域 -->
  <div class="fixed bottom-6 right-6 w-[320px] bg-bg-white border border-border rounded-lg shadow-md z-50 overflow-hidden xl:w-[280px] xl:right-4 xl:bottom-4 md:static md:w-full md:mt-6 md:shadow-none">
    <div class="px-4 py-3 border-b border-border flex justify-between items-center">
      <h3 class="flex items-center gap-[6px] text-[0.875rem] font-semibold text-text-primary m-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="text-primary">
          <path d="M3 14l4-4 3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        我的理解
      </h3>
      <span class="text-xs text-text-light">用自己的话记录你的理解</span>
    </div>

    <textarea
      v-model="note"
      class="block w-full px-4 py-3 border-none outline-none resize-none font-inherit text-[0.875rem] leading-[1.6] text-text-primary bg-transparent placeholder:text-text-light"
      placeholder="写下你对本课内容的理解...&#10;&#10;例如：&#10;- 我认为核心概念是...&#10;- 最容易混淆的地方是...&#10;- 我可以这样记忆..."
      rows="6"
    ></textarea>

    <div class="px-4 py-2 border-t border-border flex justify-between items-center">
      <span class="text-xs text-text-light">
        {{ note ? `已记录 ${note.length} 字` : '尚未记录' }}
      </span>
      <button
        v-if="note"
        class="px-3 py-1 border border-primary rounded-sm bg-transparent text-primary text-xs font-medium cursor-pointer transition-all duration-150 hover:bg-primary hover:text-white"
        @click="saveNote"
      >
        保存笔记
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MyUnderstanding - 我的理解笔记组件
 *
 * Lesson 页面右下角的反思区域。
 * 鼓励学习者用自己的语言表达对内容的理解。
 * 当前使用 localStorage 保存笔记，未来接入数据库。
 *
 * 设计意图：
 * - 促进元认知（metacognition）
 * - 帮助学习者建立主动反思的习惯
 * - 未来可接入 Diagnosis Engine 分析理解偏差
 */

const props = defineProps<{
  /** 当前 Lesson 的 slug，用于隔离不同课时的笔记 */
  lessonSlug?: string
}>()

/** 笔记内容（响应式） */
const note = ref('')

/** localStorage 键名 */
const storageKey = computed(() =>
  props.lessonSlug ? `dexinlabs_note_${props.lessonSlug}` : 'dexinlabs_note_current'
)

/** 组件挂载时从 localStorage 加载已有笔记 */
onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(storageKey.value)
    if (saved) note.value = saved
  }
})

/** 保存笔记到 localStorage */
function saveNote() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey.value, note.value)
  }
}
</script>
