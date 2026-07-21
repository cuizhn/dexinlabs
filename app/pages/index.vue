<template>
  <div class="landing">
    <section class="landing__hero">
      <div class="landing__hero-bg">
        <div class="landing__hero-grid"></div>
        <div class="landing__hero-glow landing__hero-glow--1"></div>
        <div class="landing__hero-glow landing__hero-glow--2"></div>

        <span v-for="sym in floatingSymbols" :key="sym.id" class="landing__hero-symbol" :style="sym.style">{{
          sym.char
        }}</span>
      </div>

      <div class="landing__hero-content">
        <div class="landing__hero-badge">
          <span class="landing__hero-badge-dot"></span>
          免费开放 · 持续更新
        </div>

        <h1 class="landing__hero-title">
          用数学<br />
          <span class="landing__hero-title-accent">理解世界</span>
        </h1>

        <p class="landing__hero-desc"> 从算术到微积分，系统化的学习路径与交互式练习，让每一个数学概念都变得清晰可触 </p>

        <div class="landing__hero-actions">
          <NuxtLink to="/course" class="landing__btn landing__btn--primary">
            开始学习
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

          <NuxtLink to="/course" class="landing__btn landing__btn--ghost"> 浏览课程 </NuxtLink>
        </div>

        <div class="landing__hero-stats">
          <div class="landing__hero-stat">
            <span class="landing__hero-stat-num">1</span>
            <span class="landing__hero-stat-label">核心课程</span>
          </div>
          <div class="landing__hero-stat-divider"></div>
          <div class="landing__hero-stat">
            <span class="landing__hero-stat-num">2</span>
            <span class="landing__hero-stat-label">章节内容</span>
          </div>
          <div class="landing__hero-stat-divider"></div>
          <div class="landing__hero-stat">
            <span class="landing__hero-stat-num">∞</span>
            <span class="landing__hero-stat-label">练习题库</span>
          </div>
        </div>

        
      </div>

      <div class="landing__hero-visual">
        <div class="landing__hero-card landing__hero-card--1">
          <div class="landing__hero-card-icon">∫</div>
          <div class="landing__hero-card-body">
            <span class="landing__hero-card-label">微积分基础</span>
            <div class="landing__hero-card-bar"><div class="landing__hero-card-fill" style="width: 35%"></div></div>
          </div>
        </div>
        <div class="landing__hero-card landing__hero-card--2">
          <div class="landing__hero-card-icon">∆</div>
          <div class="landing__hero-card-body">
            <span class="landing__hero-card-label">平面几何</span>
            <div class="landing__hero-card-bar"><div class="landing__hero-card-fill" style="width: 60%"></div></div>
          </div>
        </div>
        <div class="landing__hero-card landing__hero-card--3">
          <div class="landing__hero-card-icon">x²</div>
          <div class="landing__hero-card-body">
            <span class="landing__hero-card-label">代数入门</span>
            <div class="landing__hero-card-bar"><div class="landing__hero-card-fill" style="width: 80%"></div></div>
          </div>
        </div>
        <div class="landing__hero-equation">
          <span class="landing__hero-eq-part">f(x)</span>
          <span class="landing__hero-eq-op">=</span>
          <span class="landing__hero-eq-part">lim</span>
          <span class="landing__hero-eq-sub">h→0</span>
          <span class="landing__hero-eq-frac">
            <span class="landing__hero-eq-num">f(x+h) − f(x)</span>
            <span class="landing__hero-eq-den">h</span>
          </span>
        </div>
      </div>
    </section>

    <HomeFeatureGrid />

    <section class="landing__how">
      <div class="landing__section-inner">
        <div class="landing__section-header">
          <span class="landing__section-tag">学习方式</span>
          <h2 class="landing__section-title">三步开启<br />数学之旅</h2>
        </div>

        <div class="landing__how-steps">
          <div v-for="(step, i) in steps" :key="i" class="landing__how-step">
            <div class="landing__how-number">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="landing__how-content">
              <h3 class="landing__how-title">{{ step.title }}</h3>
              <p class="landing__how-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <HomeCTASection />
  </div>
</template>

<script setup lang="ts">
// 首页 - 着陆页，包含英雄区、特色功能展示和学习路径介绍
useHead({
  title: 'Dexin Labs · 用数学理解世界'
})

const floatingSymbols = computed(() => {
  const chars = ['π', '∑', '∫', '√', '∞', 'Δ', 'θ', 'λ', 'φ', 'α', 'β', '∂']
  return chars.map((char, i) => ({
    id: i,
    char,
    style: {
      '--x': `${5 + ((i * 8) % 90)}%`,
      '--y': `${10 + ((i * 17) % 75)}%`,
      '--delay': `${i * 0.7}s`,
      '--duration': `${4 + (i % 4)}s`,
      '--size': `${0.8 + (i % 3) * 0.4}rem`,
      '--rotate': `${(i * 30) % 360}deg`,
      opacity: 0.06 + (i % 3) * 0.03
    }
  }))
})

const steps = [
  {
    title: '选择课程',
    desc: '根据你的水平和兴趣，选择合适的数学课程开始学习'
  },
  {
    title: '阅读与练习',
    desc: '系统化的章节内容配合交互式练习，加深对每个知识点的理解'
  },
  {
    title: '持续进阶',
    desc: '完成课程后自动追踪进度，推荐下一步学习内容，持续提升'
  }
]
</script>

<style scoped>
.landing {
  overflow-x: hidden;
}

.landing__section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.landing__section-header {
  max-width: 480px;
  margin-bottom: var(--spacing-2xl);
}

.landing__section-tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-radius: 100px;
  margin-bottom: var(--spacing-md);
}

.landing__section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.15;
  margin-bottom: var(--spacing-md);
}

.landing__section-desc {
  font-size: 1.0625rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.landing__hero {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  overflow: hidden;
}

.landing__hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.landing__hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(79, 70, 229, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 70, 229, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 60% at 30% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 30% 50%, black 30%, transparent 80%);
}

.landing__hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.landing__hero-glow--1 {
  width: 600px;
  height: 600px;
  top: -15%;
  left: -10%;
  background: rgba(79, 70, 229, 0.08);
}

.landing__hero-glow--2 {
  width: 400px;
  height: 400px;
  bottom: -10%;
  right: 5%;
  background: rgba(6, 182, 212, 0.06);
}

.landing__hero-symbol {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: var(--size);
  color: var(--color-primary);
  font-weight: 700;
  transform: rotate(var(--rotate));
  animation: symbol-float var(--duration) ease-in-out var(--delay) infinite alternate;
  pointer-events: none;
  font-family: var(--font-mono);
}

@keyframes symbol-float {
  0% {
    transform: rotate(var(--rotate)) translateY(0);
  }
  100% {
    transform: rotate(var(--rotate)) translateY(-14px);
  }
}

.landing__hero-content {
  position: relative;
  z-index: 2;
  max-width: 560px;
  margin-left: max(calc((100vw - 1200px) / 2 + var(--spacing-lg)), var(--spacing-lg));
}

.landing__hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.landing__hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-success);
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.landing__hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.08;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  letter-spacing: -0.02em;
}

.landing__hero-title-accent {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.landing__hero-desc {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin-bottom: var(--spacing-xl);
}

.landing__hero-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.landing__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: all 0.25s ease;
}

.landing__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.landing__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.landing__btn--ghost {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.landing__btn--ghost:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.landing__btn--lg {
  padding: 16px 36px;
  font-size: 1rem;
}

.landing__hero-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.landing__hero-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.landing__hero-stat-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
}

.landing__hero-stat-label {
  font-size: 0.8125rem;
  color: var(--color-text-light);
}

.landing__hero-stat-divider {
  width: 1px;
  height: 32px;
  background-color: var(--color-border);
}

.landing__hero-admin-entry {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: var(--spacing-xl);
  padding: 8px 16px 8px 10px;
  background-color: rgba(79, 70, 229, 0.05);
  border: 1px solid rgba(79, 70, 229, 0.15);
  border-radius: 100px;
  transition: all 0.2s ease;
}

.landing__hero-admin-entry:hover {
  background-color: rgba(79, 70, 229, 0.1);
  border-color: var(--color-primary);
}

.landing__hero-admin-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary);
  flex-shrink: 0;
}

.landing__hero-admin-link {
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.landing__hero-admin-entry:hover .landing__hero-admin-link {
  color: var(--color-primary);
}

.landing__hero-admin-arrow {
  font-size: 0.8125rem;
  color: var(--color-primary);
  transition: transform 0.2s ease;
}

.landing__hero-admin-entry:hover .landing__hero-admin-arrow {
  transform: translateX(3px);
}

.landing__hero-visual {
  position: absolute;
  right: max(calc((100vw - 1200px) / 2 + var(--spacing-lg)), var(--spacing-lg));
  top: 50%;
  transform: translateY(-50%);
  width: 360px;
  z-index: 1;
}

.landing__hero-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  margin-bottom: var(--spacing-md);
  animation: card-slide-in 0.6s ease-out both;
}

.landing__hero-card--1 {
  animation-delay: 0.2s;
  margin-left: 0;
}
.landing__hero-card--2 {
  animation-delay: 0.4s;
  margin-left: 40px;
}
.landing__hero-card--3 {
  animation-delay: 0.6s;
  margin-left: 16px;
}

@keyframes card-slide-in {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.landing__hero-card-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.landing__hero-card--1 .landing__hero-card-icon {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}
.landing__hero-card--2 .landing__hero-card-icon {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}
.landing__hero-card--3 .landing__hero-card-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.landing__hero-card-body {
  flex: 1;
  min-width: 0;
}

.landing__hero-card-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 6px;
}

.landing__hero-card-bar {
  height: 4px;
  background-color: var(--color-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.landing__hero-card-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  animation: fill-grow 1.2s ease-out 0.8s both;
}

@keyframes fill-grow {
  from {
    width: 0 !important;
  }
}

.landing__hero-equation {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  animation: card-slide-in 0.6s ease-out 0.8s both;
  margin-left: 60px;
}

.landing__hero-eq-part {
  color: var(--color-primary);
  font-weight: 600;
}

.landing__hero-eq-op {
  font-weight: 700;
  color: var(--color-text-primary);
}

.landing__hero-eq-sub {
  font-size: 0.625rem;
  align-self: flex-end;
  margin-bottom: 2px;
  color: var(--color-text-light);
}

.landing__hero-eq-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.landing__hero-eq-num {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 2px;
  font-size: 0.75rem;
}

.landing__hero-eq-den {
  padding-top: 2px;
  font-size: 0.75rem;
}

.landing__features {
  padding: 6rem 0;
  background-color: var(--color-bg-secondary);
}

.landing__features-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-lg);
}

.landing__feature {
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  transition: all 0.3s ease;
}

.landing__feature:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.landing__feature--lg {
  grid-column: span 3;
}

.landing__feature--md {
  grid-column: span 2;
}

.landing__feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  margin-bottom: var(--spacing-md);
}

.landing__feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.landing__feature-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.landing__courses {
  padding: 6rem 0;
}

.landing__courses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.landing__course {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.landing__course::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.02), rgba(6, 182, 212, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.landing__course:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.landing__course:hover::after {
  opacity: 1;
}

.landing__course-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.landing__course-icon--beginner {
  background: linear-gradient(135deg, #10b981, #059669);
}

.landing__course-icon--intermediate {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.landing__course-icon--advanced {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.landing__course-body {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.landing__course-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.landing__course-desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.landing__course-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.landing__course-chapters {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.landing__course-difficulty {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.landing__course-difficulty--beginner {
  background-color: #ecfdf5;
  color: #059669;
}

.landing__course-difficulty--intermediate {
  background-color: #fff7ed;
  color: #d97706;
}

.landing__course-difficulty--advanced {
  background-color: #eef2ff;
  color: #6366f1;
}

.landing__course-arrow {
  position: relative;
  z-index: 1;
  color: var(--color-text-light);
  transition: all 0.25s ease;
}

.landing__course:hover .landing__course-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

.landing__how {
  padding: 6rem 0;
  background-color: var(--color-bg-secondary);
}

.landing__how-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.landing__how-step {
  position: relative;
  padding: var(--spacing-xl);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  transition: all 0.3s ease;
}

.landing__how-step:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.landing__how-number {
  font-size: 3rem;
  font-weight: 800;
  font-family: var(--font-mono);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: var(--spacing-md);
}

.landing__how-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.landing__how-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

@media (max-width: 1024px) {
  .landing__hero-visual {
    display: none;
  }

  .landing__hero-content {
    margin-left: 0;
    max-width: 600px;
  }

  .landing__hero-title {
    font-size: 3rem;
  }

  .landing__features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .landing__feature--lg {
    grid-column: span 2;
  }

  .landing__feature--md {
    grid-column: span 1;
  }

  .landing__courses-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .landing__hero {
    min-height: auto;
    padding: var(--spacing-2xl) var(--spacing-md);
    padding-top: 3rem;
  }

  .landing__hero-title {
    font-size: 2.25rem;
  }

  .landing__hero-desc {
    font-size: 1rem;
  }

  .landing__hero-actions {
    flex-direction: column;
  }

  .landing__hero-stats {
    gap: var(--spacing-md);
  }

  .landing__hero-stat-num {
    font-size: 1.25rem;
  }

  .landing__section-inner {
    padding: 0 var(--spacing-md);
  }

  .landing__section-title {
    font-size: 1.75rem;
  }

  .landing__features {
    padding: 4rem 0;
  }

  .landing__features-grid {
    grid-template-columns: 1fr;
  }

  .landing__feature--lg,
  .landing__feature--md {
    grid-column: span 1;
  }

  .landing__courses {
    padding: 4rem 0;
  }

  .landing__course {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .landing__course-meta {
    flex-direction: row;
    align-items: center;
  }

  .landing__course-arrow {
    display: none;
  }

  .landing__how {
    padding: 4rem 0;
  }

  .landing__how-steps {
    grid-template-columns: 1fr;
  }

  .landing__cta-inner {
    margin-left: var(--spacing-md);
    margin-right: var(--spacing-md);
    padding: 3rem var(--spacing-lg);
  }

  .landing__cta-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .landing__hero-title {
    font-size: 1.875rem;
  }

  .landing__hero-badge {
    font-size: 0.75rem;
    padding: 4px 12px;
  }

  .landing__btn {
    padding: 10px 20px;
    font-size: 0.875rem;
    justify-content: center;
  }

  .landing__hero-stats {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .landing__hero-stat-divider {
    display: none;
  }

  .landing__hero-stat {
    flex-direction: row;
    gap: 6px;
    align-items: center;
  }

  .landing__section-title {
    font-size: 1.5rem;
  }

  .landing__cta-title {
    font-size: 1.5rem;
  }

  .landing__cta-deco {
    font-size: 8rem;
  }
}
</style>
