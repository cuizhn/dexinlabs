<template>
  <!-- 我的理解 - Lesson 页面右下角的笔记区域 -->
  <div class="my-understanding">
    <div class="my-understanding__header">
      <h3 class="my-understanding__title">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 14l4-4 3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        我的理解
      </h3>
      <span class="my-understanding__hint">用自己的话记录你的理解</span>
    </div>

    <textarea
      v-model="note"
      class="my-understanding__textarea"
      placeholder="写下你对本课内容的理解...&#10;&#10;例如：&#10;- 我认为核心概念是...&#10;- 最容易混淆的地方是...&#10;- 我可以这样记忆..."
      rows="6"
    ></textarea>

    <div class="my-understanding__footer">
      <span class="my-understanding__status">
        {{ note ? `已记录 ${note.length} 字` : '尚未记录' }}
      </span>
      <button
        v-if="note"
        class="my-understanding__save-btn"
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

<style scoped>
.my-understanding {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  width: 320px;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  z-index: 50;
  overflow: hidden;
}

.my-understanding__header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.my-understanding__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.my-understanding__title svg {
  color: var(--color-primary);
}

.my-understanding__hint {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.my-understanding__textarea {
  display: block;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: transparent;
}

.my-understanding__textarea::placeholder {
  color: var(--color-text-light);
}

.my-understanding__footer {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.my-understanding__status {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.my-understanding__save-btn {
  padding: 4px 12px;
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius-sm);
  background: transparent;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.my-understanding__save-btn:hover {
  background: var(--color-primary);
  color: #fff;
}

@media (max-width: 1200px) {
  .my-understanding {
    width: 280px;
    right: var(--spacing-lg);
    bottom: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .my-understanding {
    position: static;
    width: 100%;
    margin-top: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    box-shadow: none;
  }
}
</style>
