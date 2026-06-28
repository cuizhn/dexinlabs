<!--
  组件文件名：Header.vue
  Nuxt自动注册组件名：AppHeader
  被引用页面/布局：app/layouts/default.vue（全局布局，所有页面共用）
  Props：无（未使用 defineProps）
  Emits：无（未使用 defineEmits）
  CSS 变量引用：
    --color-bg-primary: 导航栏背景色（主背景色）
    --color-border: 导航栏底部边框色
    --shadow-sm: 导航栏底部阴影
    --spacing-lg / --spacing-md / --spacing-sm / --spacing-xl: 间距变量
    --color-primary: 主题色（品牌色、激活项背景）
    --color-text-primary: 主要文字颜色
    --color-bg-secondary: 次级背景色（悬停背景）
    --border-radius-md: 圆角大小
-->
<!--
  AppHeader 组件 - 顶部导航栏
  功能说明：
  - 固定在页面顶部的导航栏，包含品牌 Logo、桌面端导航菜单、移动端汉堡菜单
  - 桌面端显示水平导航链接，移动端（≤768px）隐藏导航并显示汉堡按钮
  - 点击汉堡按钮展开/收起移动端垂直导航菜单
  - 根据当前路由路径高亮对应的导航项
-->
<template>
  <!-- 顶部导航栏容器 -->
  <header class="app-header">
    <div class="app-header__container">
      <!-- Logo 区域：点击返回首页 -->
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__logo-icon">∑</span>
        <span class="app-header__logo-text">Dexin Labs</span>
      </NuxtLink>

      <!-- 桌面端导航菜单：水平排列的导航链接 -->
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

      <!-- 移动端汉堡菜单按钮：点击切换菜单展开/收起 -->
      <button
        class="app-header__menu-btn"
        @click="toggleMenu"
        aria-label="切换导航菜单"
      >
        <span class="app-header__menu-icon" :class="{ 'app-header__menu-icon--open': isMenuOpen }"></span>
      </button>
    </div>

    <!-- 移动端导航菜单：垂直排列的导航链接，菜单打开时显示 -->
    <nav
      class="app-header__mobile-nav"
      :class="{ 'app-header__mobile-nav--open': isMenuOpen }"
    >
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

<script setup lang="ts">
// import: useRoute 来自 'nuxt/app'，Nuxt 官方组合式 API，用于获取当前路由对象（包含 path、query、params 等信息），数据类型为 RouteLocationNormalizedLoaded
import { useRoute } from 'nuxt/app'
// import: ref 来自 'vue'，Vue 3 组合式 API，用于创建基本类型的响应式变量；computed 来自 'vue'，用于创建派生状态的计算属性
import { ref, computed } from 'vue'

// interface: 导航项的类型定义，描述每个导航菜单项的数据结构
interface NavItem {
  // path: 导航跳转的路由路径，数据类型 string
  path: string
  // label: 导航项显示的文字标签，数据类型 string
  label: string
  // exact: 可选字段，是否精确匹配路由（首页需要精确匹配，避免子路由也高亮），数据类型 boolean | undefined
  exact?: boolean
}

// navItems: 导航菜单配置数组，数据类型 NavItem[]，包含5个导航项（首页/同步学习/课程中心/学习方法/关于我们）
const navItems: NavItem[] = [
  { path: '/', label: '首页', exact: true },
  { path: '/study', label: '同步学习' },
  { path: '/course', label: '课程中心' },
  { path: '/methods', label: '学习方法' },
  { path: '/about', label: '关于我们' },
]

// isMenuOpen: 响应式变量，移动端菜单是否展开的状态，数据类型 Ref<boolean>，默认值 false（收起）
const isMenuOpen = ref(false)

// route: 当前路由对象，必须在 setup 顶层调用 useRoute() 获取，数据类型 RouteLocationNormalizedLoaded
const route = useRoute()

// currentPath: 计算属性，返回当前路由的路径字符串，数据类型 ComputedRef<string>，用于导航项高亮判断
const currentPath = computed(() => route.path)
// isActive: 函数，判断某个导航项是否处于激活状态（当前路由匹配），参数 item: NavItem，返回值 boolean
//   逻辑：exact 为 true 时精确匹配路径，否则匹配路径前缀（支持子路由高亮）
function isActive(item: NavItem): boolean {
  if (item.exact) return currentPath.value === item.path
  return currentPath.value === item.path || currentPath.value.startsWith(`${item.path}/`)
}

// toggleMenu: 函数，切换移动端菜单的展开/收起状态，无参数，无返回值
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// closeMenu: 函数，关闭移动端菜单（点击导航链接后调用），无参数，无返回值
function closeMenu() {
  isMenuOpen.value = false
}
</script>

<style scoped>
/* 顶部导航栏：固定定位、顶部对齐、带底部边框和阴影 */
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

/* 导航栏内容容器：限制最大宽度、水平布局、居中对齐 */
.app-header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Logo 链接样式：水平排列图标和文字 */
.app-header__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-primary);
}

/* Logo 图标样式 */
.app-header__logo-icon {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Logo 文字样式 */
.app-header__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
}

/* 桌面端导航菜单：水平排列导航项 */
.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

/* 导航项样式：带圆角和过渡动画 */
.app-header__nav-item {
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

/* 导航项悬停样式 */
.app-header__nav-item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

/* 当前激活的导航项样式：主题色背景 + 白色文字 */
.app-header__nav-item--active {
  background-color: var(--color-primary);
  color: white;
}

/* 汉堡菜单按钮：默认隐藏，移动端显示 */
.app-header__menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
}

/* 汉堡菜单图标容器 */
.app-header__menu-icon {
  display: block;
  width: 24px;
  height: 24px;
  position: relative;
}

/* 汉堡菜单图标的上下两条横线（伪元素实现） */
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

/* 上横线位置 */
.app-header__menu-icon::before {
  top: 6px;
}

/* 下横线位置 */
.app-header__menu-icon::after {
  bottom: 6px;
}

/* 菜单打开时上横线旋转为 X 形 */
.app-header__menu-icon--open::before {
  transform: rotate(45deg);
  top: 11px;
}

/* 菜单打开时下横线旋转为 X 形 */
.app-header__menu-icon--open::after {
  transform: rotate(-45deg);
  bottom: 11px;
}

/* 移动端导航菜单：默认隐藏，打开时显示 */
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

/* 移动端导航菜单打开状态 */
.app-header__mobile-nav--open {
  display: block;
}

/* 移动端导航项样式：垂直排列 */
.app-header__mobile-nav-item {
  display: block;
  padding: var(--spacing-md) var(--spacing-xl);
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 500;
  transition: background-color 0.2s ease;
}

/* 移动端导航项悬停样式 */
.app-header__mobile-nav-item:hover {
  background-color: var(--color-bg-secondary);
}

/* 响应式：平板及以下屏幕隐藏桌面导航，显示汉堡按钮 */
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

/* 响应式：小屏幕缩小 Logo 文字 */
@media (max-width: 480px) {
  .app-header__logo-text {
    font-size: 1rem;
  }
}
</style>
