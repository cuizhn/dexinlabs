<template>
  <section class="landing__features">
    <div class="landing__section-inner">
      <div class="landing__section-header">
        <span class="landing__section-tag">核心优势</span>
        <h2 class="landing__section-title">为数学学习<br />量身打造</h2>
        <p class="landing__section-desc">不只是视频和文字，而是真正可交互的学习体验</p>
      </div>

      <div class="landing__features-grid">
        <div v-for="(feat, i) in features" :key="i" class="landing__feature" :class="`landing__feature--${feat.size}`">
          <div class="landing__feature-icon" :style="{ backgroundColor: feat.bg }">
            <span>{{ feat.icon }}</span>
          </div>
          <h3 class="landing__feature-title">{{ feat.title }}</h3>
          <p class="landing__feature-desc">{{ feat.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
const features = [
  {
    icon: '📐',
    title: '系统化课程',
    desc: '从代数几何到概率统计，完整覆盖中学数学知识体系，每个阶段都有清晰的学习目标和路径规划',
    size: 'lg',
    bg: '#EEF2FF'
  },
  {
    icon: '✏️',
    title: '交互式练习',
    desc: '单选题、填空题等多种题型，即时判题反馈，边学边练巩固知识',
    size: 'md',
    bg: '#ECFDF5'
  },
  {
    icon: '📊',
    title: '学习追踪',
    desc: '实时记录学习进度，可视化展示知识掌握程度',
    size: 'md',
    bg: '#FFF7ED'
  },
  {
    icon: '🔬',
    title: '公式渲染',
    desc: 'KaTeX 驱动的数学公式渲染，让复杂的数学表达式清晰呈现',
    size: 'md',
    bg: '#FDF2F8'
  },
  {
    icon: '📱',
    title: '多端适配',
    desc: '响应式设计，手机、平板、电脑随时随地学习',
    size: 'lg',
    bg: '#F0F9FF'
  }
]
</script>
<style scoped>
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
  grid-column: span 2;
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

@media (max-width: 1024px) {
  .landing__features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .landing__feature--lg {
    grid-column: span 2;
  }

  .landing__feature--md {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
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
}

@media (max-width: 480px) {
  .landing__section-title {
    font-size: 1.5rem;
  }
}
</style>
