<template>
  <nav class="map" aria-label="知识地图">
    <ul class="map__list">
      <li v-for="topic in topics" :key="topic.slug" class="map__item">
        <NuxtLink :to="`/courses/${topic.slug}`" class="map__link">
          <span class="map__title">{{ topic.title }}</span>
          <span class="map__desc">{{ topic.description }}</span>
          <span class="map__arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
/**
 * KnowledgeMap - 知识地图（首页）
 *
 * 以近黑白文本列呈现真实 4 个主题，不使用彩色卡片 / emoji 图标。
 * 链接指向真实课程页。不修改 Course/Topic 数据结构。
 */
defineProps<{
  topics: { slug: string, title: string, description: string }[]
}>()
</script>

<style scoped>
.map {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
}

.map__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--home-border, #e4e4e7);
}

.map__item {
  border-bottom: 1px solid var(--home-border, #e4e4e7);
}

.map__link {
  display: grid;
  grid-template-columns: minmax(0, 8rem) minmax(0, 1fr) 1.5rem;
  align-items: baseline;
  gap: 1rem;
  padding: 1.25rem 0.25rem;
  text-decoration: none;
  color: var(--home-fg, #18181b);
  transition: background-color 0.2s ease, padding-left 0.2s ease;
}

.map__link:hover {
  background: var(--home-surface-2, #f4f4f5);
  padding-left: 0.75rem;
}

.map__title {
  font-size: var(--home-body, 1.0625rem);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.map__desc {
  font-size: var(--home-sm, 0.9375rem);
  color: var(--home-secondary, #52525b);
  line-height: 1.5;
}

.map__arrow {
  text-align: right;
  color: var(--home-muted, #a1a1aa);
  transition: color 0.2s ease, transform 0.2s ease;
}

.map__link:hover .map__arrow {
  color: var(--home-accent, #3b6fe0);
  transform: translateX(3px);
}

@media (max-width: 640px) {
  .map__link {
    grid-template-columns: 1fr 1.5rem;
    grid-template-areas:
      'title arrow'
      'desc arrow';
    gap: 0.25rem 1rem;
  }
  .map__title {
    grid-area: title;
  }
  .map__desc {
    grid-area: desc;
  }
  .map__arrow {
    grid-area: arrow;
    align-self: center;
  }
}
</style>
