<template>
  <div class="knowledge-map">
    <section class="knowledge-map__header">
      <div class="container">
        <h1 class="knowledge-map__title">知识地图</h1>
        <p class="knowledge-map__desc">
          选择你感兴趣的领域，展开探索每个主题下的学习内容
        </p>
      </div>
    </section>

    <section class="knowledge-map__body">
      <div class="container">
        <div v-if="loading" class="knowledge-map__loading">加载中...</div>

        <div v-else class="knowledge-map__grid">
          <div
            v-for="dp in domainPages"
            :key="dp.domain.slug"
            class="domain-card"
          >
            <NuxtLink :to="`/${dp.domain.slug}`" class="domain-card__header">
              <h2 class="domain-card__title">{{ dp.domain.title }}</h2>
              <span class="domain-card__count">
                {{ (dp.topics || []).length }} 个主题
              </span>
            </NuxtLink>

            <p v-if="dp.domain.description" class="domain-card__desc">{{ dp.domain.description }}</p>

            <div v-if="expandedDomain === dp.domain.slug" class="domain-card__topics">
              <NuxtLink
                v-for="t in dp.topics"
                :key="t.slug"
                :to="`/${dp.domain.slug}/${t.slug}`"
                class="domain-card__topic-link"
              >
                {{ t.title }}
              </NuxtLink>
            </div>

            <button
              class="domain-card__toggle"
              @click.prevent="toggleDomain(dp.domain.slug)"
            >
              {{ expandedDomain === dp.domain.slug ? '收起' : '展开主题' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 知识地图页 - 展示全部知识领域及其主题
 *
 * 第一层：Domain 列表（卡片）
 * 第二层：点击展开 Topic 列表
 * 第三层：点击 Topic 进入主题页面
 */
useHead({ title: '知识地图' })

const { domains: domainPages, loading } = await useKnowledgeMap()

const expandedDomain = ref<string | null>(null)

function toggleDomain(slug: string) {
  expandedDomain.value = expandedDomain.value === slug ? null : slug
}
</script>

<style scoped>
.knowledge-map__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.knowledge-map__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.knowledge-map__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
.knowledge-map__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.knowledge-map__loading {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}
.knowledge-map__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}
.domain-card {
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
}
.domain-card__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  text-decoration: none;
  color: inherit;
  margin-bottom: var(--spacing-sm);
}
.domain-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}
.domain-card__count {
  font-size: 0.8rem;
  color: var(--color-text-light);
  white-space: nowrap;
}
.domain-card__desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-md);
}
.domain-card__topics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) 0;
  border-top: 1px dashed var(--color-border);
}
.domain-card__topic-link {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  text-decoration: none;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 150ms ease;
}
.domain-card__topic-link:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.domain-card__toggle {
  display: block;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}
.domain-card__toggle:hover {
  text-decoration: underline;
}
</style>
