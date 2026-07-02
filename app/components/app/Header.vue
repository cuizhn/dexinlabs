<template>
  <header class="app-header">
    <div class="app-header__container">
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__logo-icon">∑</span>
        <span class="app-header__logo-text">Dexin Labs</span>
      </NuxtLink>

      <nav class="app-header__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="app-header__nav-item"
          :class="{ 'app-header__nav-item--active': isActive(item) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <button class="app-header__menu-btn" @click="toggleMenu" aria-label="切换导航菜单">
        <span class="app-header__menu-icon" :class="{ 'app-header__menu-icon--open': isMenuOpen }"></span>
      </button>
    </div>

    <nav class="app-header__mobile-nav" :class="{ 'app-header__mobile-nav--open': isMenuOpen }">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="app-header__mobile-nav-item"
        @click="closeMenu"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from 'nuxt/app'

import { ref, computed } from 'vue'

const navItems = [
  { path: '/', label: '首页', exact: true },
  { path: '/study', label: '同步学习' },
  { path: '/course', label: '课程中心' },
  { path: '/methods', label: '学习方法' },
  { path: '/about', label: '关于我们' }
]

const isMenuOpen = ref(false)

const route = useRoute()

const currentPath = computed(() => route.path)

function isActive(item) {
  if (item.exact) return currentPath.value === item.path
  return currentPath.value === item.path || currentPath.value.startsWith(`${item.path}/`)
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.app-header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.app-header__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-primary);
}

.app-header__logo-icon {
  font-size: 1.5rem;
  font-weight: 700;
}

.app-header__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.app-header__nav-item {
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.app-header__nav-item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

.app-header__nav-item--active {
  background-color: var(--color-primary);
  color: white;
}

.app-header__menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
}

.app-header__menu-icon {
  display: block;
  width: 24px;
  height: 24px;
  position: relative;
}

.app-header__menu-icon::before,
.app-header__menu-icon::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-text-primary);
  transition: all 0.3s ease;
}

.app-header__menu-icon::before {
  top: 6px;
}

.app-header__menu-icon::after {
  bottom: 6px;
}

.app-header__menu-icon--open::before {
  transform: rotate(45deg);
  top: 11px;
}

.app-header__menu-icon--open::after {
  transform: rotate(-45deg);
  bottom: 11px;
}

.app-header__mobile-nav {
  display: none;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-md) 0;
}

.app-header__mobile-nav--open {
  display: block;
}

.app-header__mobile-nav-item {
  display: block;
  padding: var(--spacing-md) var(--spacing-xl);
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.app-header__mobile-nav-item:hover {
  background-color: var(--color-bg-secondary);
}

@media (max-width: 768px) {
  .app-header__nav {
    display: none;
  }

  .app-header__menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app-header__container {
    padding: 0 var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .app-header__logo-text {
    font-size: 1rem;
  }
}
</style>
