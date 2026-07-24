@ -1,129 +0,0 @@
<template>
  <div class="domain-index">
    <section class="domain-index__header">
      <div class="container">
        <h1 class="domain-index__title">{{ domain?.title || '知识领域' }}</h1>
        <p v-if="domain?.description" class="domain-index__subtitle">
          {{ domain.description }}
        </p>
      </div>
    </section>

    <section class="domain-index__body">
      <div class="container">
        <template v-if="topics.length">
          <div class="domain-index__grid">
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
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * Domain 知识领域首页
 *
 * 知识地图展开后的领域落地页。展示该领域概览及其下所有 Topic 列表。
 * 用户从 /map 点击某个领域后进入此页。
 */
const domainSlug = useRouteParam('domain') ?? ''

const { domain, topics } = await useDomainPage(domainSlug)

useHead({
  title: computed(() => domain.value?.title || '知识领域')
})
</script>

<style scoped>
.domain-index__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.domain-index__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.domain-index__subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
.domain-index__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.domain-index__grid {
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
</style>