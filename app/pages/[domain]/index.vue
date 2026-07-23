<template>
  <div class="domain-page">
    <LearningHeader
      :title="domain?.title || '知识领域'"
      back-path="/map"
    />

    <main class="domain-page__main">
      <section class="domain-page__intro">
        <p v-if="domain?.description" class="domain-page__desc">
          {{ domain.description }}
        </p>
      </section>

      <section class="domain-page__topics">
        <div class="domain-page__grid">
          <NuxtLink v-for="t in topics" :key="t.slug" :to="`/${domainSlug}/${t.slug}`" class="topic-card">
            <div class="topic-card__order">
              {{ String(t.order).padStart(2, '0') }}
            </div>

            <h2 class="topic-card__title">{{ t.title }}</h2>

            <p v-if="t.summary" class="topic-card__desc">
              {{ t.summary }}
            </p>

            <div class="topic-card__footer">
              <span class="topic-card__cta">开始探索 →</span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </main>

    <div class="domain-page__bottom" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'learning'
})

const domainSlug = useRouteParam('domain') ?? ''

const { domain, topics } = await useDomainPage(domainSlug)

useHead({
  title: computed(() => domain.value?.title || '知识领域')
})
</script>

<style scoped>
.domain-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.domain-page__main {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.domain-page__intro {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.domain-page__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}

.domain-page__topics {
  margin-top: var(--spacing-xl);
}

.domain-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.topic-card {
  display: block;
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: inherit;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.topic-card__order {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.topic-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
  line-height: 1.4;
}

.topic-card__desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-lg);
  min-height: 3em;
}

.topic-card__footer {
  border-top: 1px dashed var(--color-border);
  padding-top: var(--spacing-md);
}

.topic-card__cta {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
}

.domain-page__bottom {
  height: var(--spacing-xl);
}

@media (max-width: 768px) {
  .domain-page__main {
    padding: var(--spacing-lg);
  }

  .domain-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>