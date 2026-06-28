<!--
  组件文件名：CTASection.vue
  Nuxt自动注册组件名：HomeCTASection
  被引用页面：app/pages/index.vue（首页，第129行 <HomeCTASection />）
  Props：无（无 script setup，未使用 defineProps）
  Emits：无（无 script setup，未使用 defineEmits）
  CSS 变量引用：
    --spacing-xl: 内边距间距变量
    --color-primary: 渐变背景起始色、按钮文字颜色
    --color-secondary: 渐变背景结束色
    --border-radius-xl: 大圆角大小
-->
<template>
<!-- CTA 行动号召区域：引导用户立即开始学习 -->
    <!-- CTA 区域外层容器：设置垂直内边距和全宽 -->
    <section class="landing__cta">
      <!-- CTA 内部容器：渐变背景卡片，居中展示内容 -->
      <div class="landing__cta-inner">
        <!-- 装饰符号：右下角大号半透明求和符号 ∑，纯视觉装饰 -->
        <div class="landing__cta-deco">∑</div>
        <!-- CTA 标题：白色大字，引导性问句 -->
        <h2 class="landing__cta-title">准备好开始了吗？</h2>
        <!-- CTA 描述：半透明白色辅助文字 -->
        <p class="landing__cta-desc">数学的世界等你探索，从第一步开始</p>
        <!-- CTA 主按钮：跳转课程中心，大号主按钮样式带箭头图标 -->
        <NuxtLink to="/course" class="landing__btn landing__btn--primary landing__btn--lg">
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