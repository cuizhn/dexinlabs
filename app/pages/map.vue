<template>
  <div>
    <!-- 顶部标题区 -->
    <section class="py-12 px-6 text-center bg-gradient-to-b from-bg-secondary to-transparent">
      <div class="container">
        <h1 class="text-[2.25rem] font-bold text-text-primary mb-3">知识地图</h1>
        <p class="text-base text-text-secondary max-w-[560px] mx-auto leading-[1.6]">
          浏览完整的知识体系，找到你想学习的主题
        </p>
      </div>
    </section>

    <!-- Domain 过滤器 -->
    <section class="py-4 px-6 border-b border-border">
      <div class="container">
        <div class="flex gap-2 flex-wrap">
          <button
            class="px-4 py-2 border border-border rounded-md bg-bg-white text-text-secondary text-sm font-medium cursor-pointer transition-all duration-150 hover:border-primary hover:text-primary"
            :class="{ 'bg-primary border-primary text-white hover:text-white': selectedDomain === null }"
            @click="selectedDomain = null"
          >
            全部
          </button>
          <button
            v-for="dp in domainPages"
            :key="dp.domain.slug"
            class="px-4 py-2 border border-border rounded-md bg-bg-white text-text-secondary text-sm font-medium cursor-pointer transition-all duration-150 hover:border-primary hover:text-primary"
            :class="{ 'bg-primary border-primary text-white hover:text-white': selectedDomain === dp.domain.slug }"
            @click="selectedDomain = dp.domain.slug"
          >
            {{ dp.domain.title }}
          </button>
        </div>
      </div>
    </section>

    <!-- Topic 列表主体 -->
    <section class="py-8 px-6 pb-24">
      <div class="container">
        <div v-if="loading" class="text-center py-12 text-text-muted">加载中...</div>

        <div v-else class="grid grid-cols-auto-fill-[300px] gap-6 items-start">
          <template v-for="dp in filteredDomains" :key="dp.domain.slug">
            <!-- 当选择了「全部」时，显示 Domain 分组标题 -->
            <div
              v-if="selectedDomain === null && dp.topics.length > 0"
              class="col-span-full text-base font-semibold text-text-secondary py-2 border-b border-border mb-1"
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

        <div v-if="!loading && allTopics.length === 0" class="text-center py-12 text-text-muted">
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
