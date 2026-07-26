<template>
  <header class="fixed top-0 left-0 right-0 z-100 bg-bg-primary border-b border-border shadow-sm">
    <div class="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-12 md:px-4">
      <NuxtLink to="/" class="flex items-center gap-2 no-underline text-primary">
        <span class="text-[1.5rem] font-bold">∑</span>
        <span class="text-xl font-bold xs:text-base">得心实验室</span>
      </NuxtLink>

      <nav class="flex items-center gap-6 md:hidden" aria-label="主导航">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="no-underline text-text-primary font-medium px-3 py-2 rounded-md transition-all duration-200 hover:bg-bg-secondary hover:text-primary"
          :class="{ 'bg-primary text-white hover:text-white': isActive(item) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <button class="hidden md:flex items-center justify-center bg-none border-none cursor-pointer p-2" @click="toggleMenu" aria-label="切换导航菜单" :aria-expanded="isMenuOpen">
        <span class="block w-6 h-6 relative before:content-[''] before:absolute before:left-0 before:w-full before:h-0.5 before:bg-text-primary before:transition-all before:duration-300 before:top-[6px] after:content-[''] after:absolute after:left-0 after:w-full after:h-0.5 after:bg-text-primary after:transition-all after:duration-300 after:bottom-[6px]" :class="{ 'before:rotate-45 before:top-[11px] after:rotate-[-45deg] after:bottom-[11px]': isMenuOpen }"></span>
      </button>
    </div>

    <nav class="hidden absolute top-16 left-0 right-0 bg-bg-primary border-b border-border py-3" :class="{ 'block': isMenuOpen }" aria-label="移动端导航" :aria-hidden="!isMenuOpen">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="block px-6 py-3 no-underline text-text-primary font-medium transition-colors duration-200 hover:bg-bg-secondary"
        @click="closeMenu"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
interface NavItem {
  path: string
  label: string
  exact?: boolean
}

const navItems: NavItem[] = [
  
  { path: '/map', label: '探索' },
{ path: '/about', label: '关于我' }
]

const isMenuOpen = ref(false)

const route = useRoute()

const currentPath = computed(() => route.path)

function isActive(item: NavItem) {
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
