<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- Logo -->
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__logo-icon">∑</span>
        <span class="app-header__logo-text">心得实验室</span>
      </NuxtLink>

      <!-- 搜索框 -->
      <div class="app-header__search" :class="{ 'app-header__search--expanded': isSearchExpanded }">
        <button 
          v-if="!isSearchExpanded && isMobile" 
          class="app-header__search-toggle" 
          @click="expandSearch"
          aria-label="展开搜索"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <div v-else class="app-header__search-input-wrapper">
          <svg class="app-header__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            ref="searchInput"
            type="text" 
            class="app-header__search-input" 
            placeholder="搜索知识点、课程..."
            @blur="handleSearchBlur"
          />
          <button 
            v-if="isMobile" 
            class="app-header__search-close" 
            @click="collapseSearch"
            aria-label="关闭搜索"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 我的 -->
      <div class="app-header__user">
        <button class="app-header__user-btn" aria-label="我的">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 全局顶部导航栏 - Logo + Search + 我的
const isSearchExpanded = ref(false)
const isMobile = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

// 检测屏幕尺寸
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

function expandSearch() {
  isSearchExpanded.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

function collapseSearch() {
  isSearchExpanded.value = false
}

function handleSearchBlur(e: FocusEvent) {
  // 如果点击的是关闭按钮，不收起搜索框
  const relatedTarget = e.relatedTarget as HTMLElement
  if (relatedTarget?.classList.contains('app-header__search-close')) {
    return
  }
  // 移动端失焦时收起搜索框
  if (isMobile.value) {
    collapseSearch()
  }
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
  gap: var(--spacing-xl);
}

/* Logo */
.app-header__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-primary);
  flex-shrink: 0;
}

.app-header__logo-icon {
  font-size: 1.5rem;
  font-weight: 700;
}

.app-header__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
}

/* 搜索框 */
.app-header__search {
  flex: 1;
  max-width: 480px;
  display: flex;
  align-items: center;
}

.app-header__search-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.app-header__search-toggle:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

.app-header__search-input-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-md);
  transition: all 0.2s ease;
}

.app-header__search-input-wrapper:focus-within {
  border-color: var(--color-primary);
  background-color: var(--color-bg-white);
  box-shadow: 0 0 0 3px var(--color-primary-ghost);
}

.app-header__search-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  margin-right: var(--spacing-sm);
}

.app-header__search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  padding: var(--spacing-sm) 0;
}

.app-header__search-input::placeholder {
  color: var(--color-text-muted);
}

.app-header__search-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  margin-left: var(--spacing-xs);
}

.app-header__search-close:hover {
  background-color: var(--color-border-light);
  color: var(--color-text-primary);
}

/* 我的 */
.app-header__user {
  flex-shrink: 0;
}

.app-header__user-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.app-header__user-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-header__container {
    padding: 0 var(--spacing-md);
    gap: var(--spacing-md);
  }

  .app-header__logo-text {
    display: none;
  }

  .app-header__search {
    max-width: none;
  }

  .app-header__search:not(.app-header__search--expanded) {
    flex: 0;
  }

  .app-header__search--expanded {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .app-header__logo-icon {
    font-size: 1.25rem;
  }
}
</style>
