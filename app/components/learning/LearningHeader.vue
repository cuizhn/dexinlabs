<template>
  <header class="learning-header">
    <div class="learning-header__container">
      <NuxtLink v-if="backPath" :to="backPath" class="learning-header__back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 13l-3-3 3-3M7 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </NuxtLink>

      <h1 class="learning-header__title">{{ title }}</h1>

      <button v-if="showMenu" class="learning-header__menu" @click="toggleMenu">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <span v-else />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  backPath?: string
  showMenu?: boolean
}>()

const toggleMenu = () => {}
</script>

<style scoped>
.learning-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-sm) 0;
}

.learning-header__container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.learning-header__back {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 150ms ease;
}

.learning-header__back:hover {
  color: var(--color-primary);
}

.learning-header__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
  flex: 1;
}

.learning-header__menu {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--border-radius-sm);
  transition: background 150ms ease, color 150ms ease;
}

.learning-header__menu:hover {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .learning-header__container {
    padding: 0 var(--spacing-md);
  }
}
</style>