<template>
  <div class="features">
    <div
      v-for="f in features"
      :key="f.label"
      class="features__item"
    >
      <span class="features__label">{{ f.label }}</span>
      <h3 class="features__title">{{ f.title }}</h3>
      <p class="features__desc">{{ f.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * HomeFeatures — 三联特性区
 *
 * 仿 zed.dev 首页 "Fast / Agentic / Collaborative" 的多列网格布局。
 * 每列：小标签（WHY/WHAT/HOW） + 标题 + 一句话描述。
 * 列间用竖线（divide-x）分隔，移动端塌缩为单列。
 */
import { features } from './homeData'
</script>

<style scoped>
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  /* 满宽撑开，让竖线延伸到 section 内部两侧 */
  width: 100%;
}

.features__item {
  padding: 0 1.5rem;
  /* 0.8px 亚像素发丝线（zed 风格），左右双竖线让每个特性自成面板 */
  border-left: 0.8px solid var(--color-border-strong, var(--color-border));
}

.features__item:first-child {
  border-left: none;
  padding-left: 0;
}

.features__item:last-child {
  padding-right: 0;
}

.features__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.features__title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.features__desc {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .features__item {
    border-left: none;
    border-top: 1px solid var(--color-border);
    padding: 1.5rem 0 0;
  }

  .features__item:first-child {
    border-top: none;
    padding-top: 0;
  }

  .features__item:last-child {
    padding-right: 0;
  }
}
</style>
