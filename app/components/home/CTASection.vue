<template>
  <section class="py-24 w-full">
    <div class="max-w-[1200px] mx-auto p-16 md:p-10 md:px-6 bg-gradient-to-br from-primary via-[#6366f1] to-secondary rounded-xl text-center relative overflow-hidden">
      <div class="absolute -right-5 -bottom-[30px] text-[12rem] font-extrabold text-white/[0.06] leading-none pointer-events-none">∑</div>

      <h2 class="text-[2.25rem] font-extrabold text-white mb-3 relative">准备好开始了吗？</h2>

      <p class="text-[1.0625rem] text-white/80 mb-6 relative">数学的世界等你探索，从第一步开始</p>

      <NuxtLink to="/map" class="btn btn-primary btn-lg !bg-white !text-primary !shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:!shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        立即开始学习
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>
