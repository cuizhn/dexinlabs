<template>
  <div>
    <section class="py-12 px-6 text-center bg-gradient-to-b from-bg-secondary to-transparent">
      <div class="container">
        <h1 class="text-[2.25rem] font-bold text-text-primary mb-3">{{ domain?.title || '知识领域' }}</h1>
        <p v-if="domain?.description" class="text-base text-text-secondary max-w-[560px] mx-auto leading-[1.6]">
          {{ domain.description }}
        </p>
      </div>
    </section>

    <section class="py-8 px-6 pb-24">
      <div class="container">
        <template v-if="topics.length">
          <div class="grid grid-cols-auto-fill-[280px] gap-6">
            <NuxtLink v-for="t in topics" :key="t.slug" :to="`/${domainSlug}/${t.slug}`" class="topic-card">
              <div class="font-mono text-sm font-semibold text-primary mb-3">
                {{ String(t.order).padStart(2, '0') }}
              </div>

              <h2 class="text-xl font-semibold text-text-primary mb-2 leading-[1.4]">{{ t.title }}</h2>

              <p v-if="t.summary" class="text-sm text-text-secondary leading-[1.6] mb-6 min-h-[3em]">
                {{ t.summary }}
              </p>

              <div class="border-t border-dashed border-border pt-3">
                <span class="text-sm font-medium text-primary">开始探索 →</span>
              </div>
            </NuxtLink>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const domainSlug = useRouteParam('domain') ?? ''

const { domain, topics } = await useDomainPage(domainSlug)

useHead({
  title: computed(() => domain.value?.title || '知识领域')
})
</script>
