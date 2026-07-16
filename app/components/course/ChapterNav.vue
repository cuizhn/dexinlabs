<template>
  <div class="chapter-nav">
    <NuxtLink v-if="prev" :to="`/course/${prev.slug}`" class="chapter-nav__item chapter-nav__item--prev">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M10 12L6 8l4-4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <div class="chapter-nav__info">
        <span class="chapter-nav__label">上一章</span>

        <span class="chapter-nav__title">{{ prev.title }}</span>
      </div>
    </NuxtLink>

    <div v-else class="chapter-nav__placeholder"></div>

    <NuxtLink v-if="next" :to="`/course/${next.slug}`" class="chapter-nav__item chapter-nav__item--next">
      <div class="chapter-nav__info">
        <span class="chapter-nav__label">下一章</span>

        <span class="chapter-nav__title">{{ next.title }}</span>
      </div>

      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </NuxtLink>

    <div v-else class="chapter-nav__placeholder"></div>
  </div>
</template>

<script setup>
defineProps({
  prev: { type: Object, required: false },

  next: { type: Object, required: false }
})
</script>

<style scoped>
.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.chapter-nav__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 48%;
}

.chapter-nav__item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.chapter-nav__item--next {
  margin-left: auto;
  text-align: right;
  flex-direction: row-reverse;
}

.chapter-nav__item--next .chapter-nav__info {
  text-align: right;
}

.chapter-nav__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-nav__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chapter-nav__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.chapter-nav__placeholder {
  flex: 1;
  max-width: 48%;
}

@markdowndia (max-width: 768px) {
  .chapter-nav {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .chapter-nav__item {
    max-width: 100%;
  }

  .chapter-nav__placeholder {
    display: none;
  }
}
</style>
