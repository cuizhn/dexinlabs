<!-- 内容展示组件 - 统一展示各种类型的内容 -->
<template>
  <article class="bg-bg-white border border-border rounded-xl p-8">
    <header v-if="content.title" class="flex justify-between items-center mb-8">
      <NuxtLink
        v-if="content.backLink"
        :to="content.backLink"
        class="inline-flex items-center gap-[6px] text-[0.9375rem] text-text-secondary no-underline transition-colors duration-150 hover:text-primary"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 13l-3-3 3-3M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ content.backLabel }}
      </NuxtLink>
      <div v-if="content.meta" class="flex gap-3">
        <span
          v-for="(m, i) in content.meta"
          :key="i"
          class="text-sm text-text-light px-3 py-1 bg-bg-secondary rounded-md"
        >
          {{ m }}
        </span>
      </div>
    </header>

    <h1 v-if="content.title" class="text-[1.75rem] font-extrabold text-text-primary mb-6 md:text-[1.375rem]">
      {{ content.title }}
    </h1>

    <div v-if="content.intro" class="mb-8 pb-8 border-b border-border">
      <ContentRenderer :value="{ body: content.intro }" />
    </div>

    <div class="content-body">
      <ContentRenderer :value="{ body: content.body }" />
    </div>

    <div v-if="content.summary" class="mt-8 pt-8 border-t border-border">
      <ContentRenderer :value="{ body: content.summary }" />
    </div>

    <nav v-if="content.previous || content.next" class="flex justify-between mt-8 pt-6 border-t border-border md:flex-col md:gap-3">
      <NuxtLink
        v-if="content.previous"
        :to="content.previous.path"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-[0.9375rem] no-underline text-text-secondary bg-bg-white border border-border transition-all duration-250 hover:border-primary hover:text-primary md:w-full md:justify-center"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 13l-3-3 3-3M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ content.previous.title }}</span>
      </NuxtLink>

      <NuxtLink
        v-if="content.next"
        :to="content.next.path"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-[0.9375rem] no-underline text-white bg-gradient-to-br from-primary to-[#6366F1] shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)] md:w-full md:justify-center"
      >
        <span>{{ content.next.title }}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 10h8M10 6l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </NuxtLink>
    </nav>
  </article>
</template>

<script setup lang="ts">
interface ContentNavItem {
  title: string
  path: string
}

interface Content {
  title?: string
  intro?: string
  body?: string
  summary?: string
  meta?: string[]
  backLink?: string
  backLabel?: string
  previous?: ContentNavItem
  next?: ContentNavItem
}

defineProps<{
  content: Content
}>()
</script>
