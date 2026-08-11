<template>
  <div class="learning-home">
    <HomeHero />
    <HomeFeatureGrid />
    <HomeCTASection />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Dexin Labs · 学习首页'
})
</script>

<style scoped>
.learning-home {
  min-height: 100vh;
}
</style>
