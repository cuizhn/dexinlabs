<template>
  <div class="knowledge-map">
    <!-- 顶部标题区 -->
    <section class="knowledge-map__header">
      <div class="container">
        <h1 class="knowledge-map__title">知识地图</h1>
        <p class="knowledge-map__desc">
          浏览完整的知识体系，找到你想学习的主题
        </p>
      </div>
    </section>

    <!-- Domain 过滤器 -->
    <section class="knowledge-map__filter">
      <div class="container">
        <div class="knowledge-map__filter-tabs">
          <button
            class="knowledge-map__filter-tab"
            :class="{ 'knowledge-map__filter-tab--active': selectedDomain === null }"
            @click="selectedDomain = null"
          >
            全部
          </button>
          <button
            v-for="dp in domainPages"
            :key="dp.domain.slug"
            class="knowledge-map__filter-tab"
            :class="{ 'knowledge-map__filter-tab--active': selectedDomain === dp.domain.slug }"
            @click="selectedDomain = dp.domain.slug"
          >
            {{ dp.domain.title }}
          </button>
        </div>
      </div>
    </section>

    <!-- Topic 列表主体 -->
    <section class="knowledge-map__body">
      <div class="container">
        <div v-if="loading" class="knowledge-map__loading">加载中...</div>

        <div v-else class="knowledge-map__grid">
          <template v-for="dp in filteredDomains" :key="dp.domain.slug">
            <!-- 当选择了「全部」时，显示 Domain 分组标题 -->
            <div
              v-if="selectedDomain === null && dp.topics.length > 0"
              class="knowledge-map__group-title"
            >
              {{ dp.domain.title }}
            </div>

            <LearningTopicStatusCard
              v-for="t in dp.topics"
              :key="t.slug"
              :topic="t"
              :domain-slug="dp.domain.slug"
              :total-lessons="0"
            />
          </template>
        </div>

        <div v-if="!loading && allTopics.length === 0" class="knowledge-map__empty">
          暂无学习主题
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 知识地图页 - 唯一知识入口
 *
 * 顶部：Domain 过滤器（全部 / 数与代数 / 图形与几何 / 统计与概率）
 * 主体：直接展示 Topic 卡片，每个卡片显示标题、简介、学习状态
 *
 * 设计原则：
 * - Domain 不作为主体，仅作为过滤器
 * - Topic 是主要展示单元
 * - 每个 Topic 显示学习状态（待学习 / 正在学习 / 已掌握）
 */
useHead({ title: '知识地图' })

const { domains: domainPages, loading } = await useKnowledgeMap()

/** 当前选中的 Domain slug，null 表示「全部」 */
const selectedDomain = ref<string | null>(null)

/** 将 DomainPage[] 展平为 Topic 列表（用于计算总数） */
const allTopics = computed(() =>
  domainPages.value.flatMap(dp => dp.topics || [])
)

/** 根据过滤器筛选后的 Domain 列表 */
const filteredDomains = computed(() => {
  if (selectedDomain.value === null) return domainPages.value
  return domainPages.value.filter(dp => dp.domain.slug === selectedDomain.value)
})
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

/* Domain 过滤器 */
.knowledge-map__filter {
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--color-border);
}

.knowledge-map__filter-tabs {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.knowledge-map__filter-tab {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-white);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.knowledge-map__filter-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.knowledge-map__filter-tab--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.knowledge-map__filter-tab--active:hover {
  color: #fff;
}

/* Topic 网格 */
.knowledge-map__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

.knowledge-map__loading {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.knowledge-map__empty {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.knowledge-map__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  align-content: start;
}

/* Domain 分组标题（「全部」模式下显示） */
.knowledge-map__group-title {
  grid-column: 1 / -1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: var(--spacing-md) 0 var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xs);
}

.knowledge-map__group-title:first-child {
  padding-top: 0;
}
</style>
