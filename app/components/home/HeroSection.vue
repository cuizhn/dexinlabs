<!--
  组件文件名：HeroSection.vue
  Nuxt自动注册组件名：HomeHeroSection
  被引用页面：暂无（当前首页 app/pages/index.vue 使用内联 Hero 区域，未引用此组件）
  Props：无（无 script setup，未使用 defineProps）
  Emits：无（无 script setup，未使用 defineEmits）
  CSS 变量引用：无（使用硬编码颜色值 #4f7cff、#aab3d6、#cfe0ff 等）
-->
<template>
  <!-- Hero 主视觉区域容器：页面首屏展示区，居中对齐 -->
  <section class="hero">
    <!-- 主标题：展示平台核心定位 -->
    <h1>AI 驱动的数学学习系统</h1>
    <!-- 副标题：展示平台四大核心特色 -->
    <p>结构化知识 · 交互练习 · 可视化理解 · 个性化路径</p>

    <!-- 操作按钮组：两个并排的行动按钮 -->
    <div class="actions">
      <!-- 主要按钮：蓝色实心，引导用户立即开始学习 -->
      <button class="primary">开始学习</button>
      <!-- 次要按钮：透明边框，引导用户浏览课程体系 -->
      <button class="secondary">查看课程体系</button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 120px 24px 80px;
  text-align: center;
}

h1 {
  font-size: 44px;
  margin-bottom: 12px;
}

p {
  color: #aab3d6;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.primary {
  background: #4f7cff;
  border: none;
  padding: 10px 18px;
  color: white;
  border-radius: 8px;
}

.secondary {
  background: transparent;
  border: 1px solid #4f7cff;
  padding: 10px 18px;
  color: #cfe0ff;
  border-radius: 8px;
}
</style>