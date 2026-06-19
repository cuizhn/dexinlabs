<template>
<!-- CTA 行动号召区域：引导用户立即开始学习 -->
    <section class="landing__cta">
      <div class="landing__cta-inner">
        <div class="landing__cta-deco">∑</div>
        <h2 class="landing__cta-title">准备好开始了吗？</h2>
        <p class="landing__cta-desc">数学的世界等你探索，从第一步开始</p>
        <NuxtLink to="/courses" class="landing__btn landing__btn--primary landing__btn--lg">
          立即开始学习
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </NuxtLink>
      </div>
    </section>
</template>

<style scoped>
/* ==================== CTA 行动号召区域 ==================== */
.landing__cta {
  padding: 6rem 0;
  width: 100%;
}

/* CTA 内部容器：渐变背景，圆角，居中文字 */
.landing__cta-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, #6366F1 50%, var(--color-secondary) 100%);
  border-radius: var(--border-radius-xl);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* CTA 装饰符号：右下角大号半透明 ∑ */
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

/* CTA 标题：白色大字 */
.landing__cta-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: var(--spacing-md);
  position: relative;
}

/* CTA 描述：半透明白色 */
.landing__cta-desc {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--spacing-xl);
  position: relative;
}

/* CTA 区域的主要按钮：白底紫字，覆盖默认样式 */
.landing__cta .landing__btn--primary {
  background: #fff;
  color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

/* CTA 按钮悬停：加深阴影 */
.landing__cta .landing__btn--primary:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
</style>