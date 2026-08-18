<template>
  <nav class="map" aria-label="知识地图">
    <div class="map__grid">
      <NuxtLink
        v-for="(topic, i) in topics"
        :key="topic.slug"
        :to="`/courses/${topic.slug}`"
        class="map__cell"
        :class="`map__cell--${i + 1}`"
      >
        <span class="map__index">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="map__title">{{ topic.title }}</span>
        <span class="map__desc">{{ topic.description }}</span>
        <span class="map__arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
/**
 * KnowledgeMap - 知识地图（首页）
 *
 * zed.dev 多列面板风格：2×2 网格，每个 cell 自成面板。
 * 竖线由 cell 的 border-left 承担，横线由 border-top 承担。
 * 通过 :first-child / :nth-child 精准控制边线，避免堆叠双线。
 */
defineProps<{
  topics: { slug: string, title: string, description: string }[]
}>()
</script>

<style scoped>
.map {
  width: 100%;
}

.map__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 负边距让 cell 的 border 共享，不出现双线 */
  border-top: 0.8px solid var(--color-border);
  border-left: 0.8px solid var(--color-border);
}

.map__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 1.25rem;
  border-right: 0.8px solid var(--color-border);
  border-bottom: 0.8px solid var(--color-border);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.map__cell:hover {
  background: var(--color-bg-secondary);
}

.map__cell:hover .map__arrow {
  color: var(--color-primary);
  transform: translateX(3px);
}

.map__index {
  font-family: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
}

.map__title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.map__desc {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.map__arrow {
  position: absolute;
  top: 1.5rem;
  right: 1.25rem;
  color: var(--color-text-muted);
  transition: color 0.2s ease, transform 0.2s ease;
}

@media (max-width: 640px) {
  .map__grid {
    grid-template-columns: 1fr;
  }
}
</style>
