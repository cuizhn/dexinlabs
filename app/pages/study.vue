<!-- 路由 URL: /study -->
<!-- 页面路径: /study -->
<!-- 同步学习：按学校进度跟进的学习入口 -->
<template>
  <!-- 信息类页面通用根容器（与 methods.vue 共用布局样式） -->
  <div class="info-page">
    <!-- Header 页面头部区域：展示页面标签、主标题和功能建设说明 -->
    <section class="info-page__header">
      <!-- container：全局布局工具类，限制内容最大宽度并水平居中 -->
      <div class="container">
        <!-- 页面分类标签：胶囊形小标签标识内容类别 -->
        <span class="info-page__tag">同步学习</span>
        <!-- 页面主标题 -->
        <h1 class="info-page__title">跟着节奏，稳步前行</h1>
        <!-- 页面简介/副标题：说明同步学习理念，并告知功能建设中 -->
        <p class="info-page__desc">
          与学校课程进度同步，课上学、课后练，让课堂内容真正吸收内化。
          当前功能建设中，敬请期待。
        </p>
      </div>
    </section>
    <!-- Body 内容主体区域：占位信息卡片（功能建设中临时展示） -->
    <section class="info-page__body">
      <div class="container info-page__container">
        <!-- 信息卡片：临时占位，展示七年级同步课程入口 -->
        <div class="info-card">
          <!-- 卡片图标：书籍表情符号 -->
          <div class="info-card__icon">📚</div>
          <!-- 卡片标题：年级和学期 -->
          <h2 class="info-card__title">七年级 · 上学期</h2>
          <!-- 卡片描述：教材版本和对应年级说明 -->
          <p class="info-card__desc">人教版 · 初中一年级同步课程</p>
          <!-- NuxtLink：Nuxt 自动导入的路由导航组件，to="/course" 跳转到课程中心页面 -->
          <NuxtLink to="/course" class="info-card__link">前往课程中心 →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// import: useHead 来自 'nuxt/app'，Nuxt 官方提供的组合式 API，用于设置页面 <head> 元信息
import { useHead } from 'nuxt/app';

// useHead：Nuxt 自动注册可用的 API，此处设置页面浏览器标签栏标题
useHead({ title: '同步学习' })
</script>

<style scoped>
.info-page__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.info-page__tag {
  display: inline-block;
  padding: 4px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 100px;
  margin-bottom: var(--spacing-md);
}
.info-page__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.info-page__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
.info-page__body { padding: var(--spacing-xl) 0 var(--spacing-3xl); }
.info-page__container { max-width: 800px; }
.info-card {
  padding: var(--spacing-2xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-align: center;
}
.info-card__icon { font-size: 2.5rem; margin-bottom: var(--spacing-md); }
.info-card__title { font-size: 1.25rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 var(--spacing-xs); }
.info-card__desc { font-size: 0.95rem; color: var(--color-text-secondary); margin: 0 0 var(--spacing-lg); }
.info-card__link { font-weight: 500; color: var(--color-primary); text-decoration: none; }
.info-card__link:hover { text-decoration: underline; }
</style>
