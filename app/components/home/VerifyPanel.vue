<template>
  <div class="verify">
    <div class="verify__surface">
      <p class="verify__eyebrow">{{ scene.label }}</p>
      <p class="verify__prompt">{{ scene.prompt }}</p>

      <div class="verify__options" role="radiogroup" :aria-label="scene.prompt">
        <button
          v-for="(option, i) in scene.options"
          :key="i"
          type="button"
          class="verify__option"
          :class="{
            'is-selected': selected === i,
            'is-correct': selected === i && i === correctIndex,
            'is-wrong': selected === i && i !== correctIndex
          }"
          :aria-pressed="selected === i"
          @click="selected = i"
        >
          <span class="verify__marker" aria-hidden="true" />
          <span class="verify__option-text">{{ option }}</span>
        </button>
      </div>

      <transition name="reveal">
        <p
          v-if="selected !== null"
          class="verify__result"
          :class="{ 'is-correct': selected === correctIndex }"
        >
          {{ selected === correctIndex ? scene.reveal : scene.hint }}
        </p>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * VerifyPanel - "正在验证"学习状态（首页原生交互）
 *
 * 极轻量状态动效：选择 → 结果揭示（opacity/transform 150-300ms）。
 * 仅使用单一克制强调色。不修改 AST / QuestionBlock / 学习状态系统。
 */
import { ref, computed } from 'vue'

const props = defineProps<{
  scene: {
    label: string
    prompt: string
    options: string[]
    reveal: string
    hint: string
  }
}>()

const selected = ref<number | null>(null)

/** 正确选项索引：与"距离和时间都有关"对应（静态演示数据约定） */
const correctIndex = computed(() => {
  const idx = props.scene.options.findIndex(o => o.includes('都有关'))
  return idx >= 0 ? idx : 0
})
</script>

<style scoped>
.verify {
  width: 100%;
}

.verify__surface {
  max-width: 720px;
  margin: 0 auto;
  background: var(--home-surface, #ffffff);
  border: 1px solid var(--home-border, #e4e4e7);
  border-radius: 8px;
  padding: clamp(1.5rem, 3.5vw, 2.5rem);
}

.verify__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  font-size: var(--home-caption, 0.8125rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--home-secondary, #52525b);
}

.verify__eyebrow::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--home-accent, #3b6fe0);
}

.verify__prompt {
  margin: 0 0 1.5rem;
  font-size: var(--home-h2, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--home-fg, #18181b);
}

.verify__options {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.verify__option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: var(--home-body, 1.0625rem);
  font-family: inherit;
  text-align: left;
  color: var(--home-fg, #18181b);
  background: var(--home-surface, #ffffff);
  border: 1px solid var(--home-border, #e4e4e7);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.verify__option:hover {
  border-color: var(--home-muted, #a1a1aa);
}

.verify__option.is-selected {
  border-color: var(--home-accent, #3b6fe0);
  background: var(--home-accent-soft, rgba(59, 111, 224, 0.08));
}

.verify__option.is-correct {
  border-color: var(--home-accent, #3b6fe0);
}

.verify__option.is-wrong {
  border-color: var(--home-muted, #a1a1aa);
}

.verify__marker {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border: 1px solid var(--home-muted, #a1a1aa);
  border-radius: 50%;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.verify__option.is-selected .verify__marker {
  border-color: var(--home-accent, #3b6fe0);
  background: var(--home-accent, #3b6fe0);
  box-shadow: inset 0 0 0 3px var(--home-surface, #ffffff);
}

.verify__option-text {
  line-height: 1.4;
}

.verify__result {
  margin: 1.25rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--home-border, #e4e4e7);
  font-size: var(--home-body, 1.0625rem);
  line-height: 1.7;
  color: var(--home-secondary, #52525b);
}

.verify__result.is-correct {
  color: var(--home-fg, #18181b);
}

.verify__result.is-correct::before {
  content: '→ ';
  color: var(--home-accent, #3b6fe0);
  font-weight: 600;
}

/* 极轻量揭示动效 */
.reveal-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.reveal-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
