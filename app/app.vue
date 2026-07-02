<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useHead } from 'nuxt/app'

useHead({
  titleTemplate: title => (title ? `${title} · Dexin Labs` : 'Dexin Labs · 得心实验室'),

  meta: [
    {
      name: 'description',
      content: '理解为先，应用为本。Dexin Labs（得心实验室）— 让数学学习真正得心应手。K12 数学思维学习平台。'
    }
  ]
})
</script>
