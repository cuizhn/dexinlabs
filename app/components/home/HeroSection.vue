<template>
  <section class="hero">
    <h1>AI 驱动的数学学习系统</h1>

    <p>结构化知识 · 交互练习 · 可视化理解 · 个性化路径</p>

    <div class="actions">
      <button class="primary">开始学习</button>

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
