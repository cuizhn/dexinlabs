<template>
  <div class="global-search" :class="{ 'global-search--open': isOpen }">
    <!-- Desktop 搜索框 -->
    <div class="global-search__desktop">
      <div class="global-search__input-wrapper">
        <svg class="global-search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          ref="desktopInput"
          v-model="searchQuery"
          type="text" 
          class="global-search__input" 
          placeholder="搜索课程、知识点..."
          @keydown.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Mobile 搜索图标 -->
    <button 
      class="global-search__mobile-toggle"
      aria-label="打开搜索"
      @click="openSearch"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </button>

    <!-- Mobile 搜索状态 -->
    <div class="global-search__mobile" v-if="isOpen">
      <button 
        class="global-search__mobile-close"
        aria-label="关闭搜索"
        @click="closeSearch"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
      <div class="global-search__mobile-input-wrapper">
        <svg class="global-search__mobile-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          ref="mobileInput"
          v-model="searchQuery"
          type="text" 
          class="global-search__mobile-input" 
          placeholder="搜索课程、知识点..."
          @keydown.enter="handleSearch"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 全局搜索组件
 * 
 * 职责：
 * - Desktop: 直接显示搜索框，靠右对齐
 * - Mobile Default: 显示搜索图标
 * - Mobile Search: 显示返回按钮 + 搜索输入框，Logo 和"我的"隐藏
 * 
 * 状态管理：
 * - isOpen: 控制移动端搜索状态
 * - searchQuery: 搜索关键词
 * 
 * 不使用 JS 判断屏幕尺寸，全部交给 CSS Media Query
 */

const isOpen = ref(false)
const searchQuery = ref('')

const desktopInput = ref<HTMLInputElement | null>(null)
const mobileInput = ref<HTMLInputElement | null>(null)

function openSearch() {
  isOpen.value = true
  nextTick(() => {
    mobileInput.value?.focus()
  })
}

function closeSearch() {
  isOpen.value = false
  searchQuery.value = ''
}

function handleSearch() {
  if (!searchQuery.value.trim()) return
  
  // TODO: 实现搜索逻辑
  // 后续可以 emit 事件或调用搜索服务
  console.log('搜索:', searchQuery.value)
  
  // 搜索后关闭移动端搜索状态
  if (isOpen.value) {
    closeSearch()
  }
}

// 暴露方法供父组件调用
defineExpose({
  openSearch,
  closeSearch
})
</script>

<style scoped>
.global-search {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: flex-end;
}

/* Desktop 搜索框 */
.global-search__desktop {
  display: flex;
  align-items: center;
}

.global-search__input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-md);
  transition: all 0.2s ease;
  width: 320px;
}

.global-search__input-wrapper:focus-within {
  border-color: var(--color-primary);
  background-color: var(--color-bg-white);
  box-shadow: 0 0 0 3px var(--color-primary-ghost);
}

.global-search__icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  margin-right: var(--spacing-sm);
}

.global-search__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  padding: var(--spacing-sm) 0;
}

.global-search__input::placeholder {
  color: var(--color-text-muted);
}

/* Mobile 搜索图标 */
.global-search__mobile-toggle {
  display: none;
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

.global-search__mobile-toggle:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

/* Mobile 搜索状态 */
.global-search__mobile {
  display: none;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.global-search__mobile-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.global-search__mobile-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.global-search__mobile-input-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-md);
  transition: all 0.2s ease;
}

.global-search__mobile-input-wrapper:focus-within {
  border-color: var(--color-primary);
  background-color: var(--color-bg-white);
  box-shadow: 0 0 0 3px var(--color-primary-ghost);
}

.global-search__mobile-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  margin-right: var(--spacing-sm);
}

.global-search__mobile-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  padding: var(--spacing-sm) 0;
}

.global-search__mobile-input::placeholder {
  color: var(--color-text-muted);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .global-search__desktop {
    display: none;
  }

  .global-search__mobile-toggle {
    display: flex;
  }

  .global-search--open .global-search__mobile {
    display: flex;
  }

  .global-search--open .global-search__mobile-toggle {
    display: none;
  }
}
</style>
