<!-- 默认布局 - 包含全局顶栏、主内容区、左右侧栏和页脚 -->
<template>
  <div class="min-h-screen flex flex-col bg-bg-primary">
    <AppHeader />

    <div class="flex-1 flex pt-[64px] min-h-[calc(100vh-64px)]">
      <aside v-if="$slots.left" class="flex-shrink-0 w-[280px] hidden lg:block">
        <slot name="left" />
      </aside>

      <main class="flex-1 min-w-0">
        <slot />
      </main>

      <aside v-if="$slots.right" class="flex-shrink-0 w-[280px] hidden xl:block">
        <slot name="right" />
      </aside>
    </div>

    <AppFooter />
  </div>
</template>
