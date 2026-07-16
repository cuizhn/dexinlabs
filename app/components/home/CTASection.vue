<template>
  <section class="landing__cta">
    <div class="landing__cta-inner">
      <div class="landing__cta-deco">∑</div>

      <h2 class="landing__cta-title">准备好开始了吗？</h2>

      <p class="landing__cta-desc">数学的世界等你探索，从第一步开始</p>

      <NuxtLink to="/course" class="landing__btn landing__btn--primary landing__btn--lg">
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

<style scoped>
.landing__cta {
  padding: 6rem 0;
  width: 100%;
}

.landing__cta-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, #6366f1 50%, var(--color-secondary) 100%);
  border-radius: var(--border-radius-xl);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.landing__cta-deco {
  position: absolute;
  right: -20px;
  bottom: -30px;
  font-size: 12rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.06);
  line-height: 1;
  pointer-events: none;
}

.landing__cta-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: var(--spacing-md);
  position: relative;
}

.landing__cta-desc {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.landing__cta .landing__btn--primary {
  background: #fff;
  color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.landing__cta .landing__btn--primary:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
</style>
