<template>
  <article class="page">
    <header class="header">
      <div class="container">
        <p class="label">政策</p>
        <h1 class="title">隐私政策</h1>
        <p class="updated">最近更新：2026 年 8 月</p>
      </div>
    </header>

    <div class="body">
      <div class="container">
        <div class="content">
          <section class="section">
            <h2 class="section-title">我们收集哪些信息</h2>
            <p>得心实验室以「最少必要」为原则收集信息。</p>
            <ul class="list">
              <li>学习记录：你浏览过的课时、完成的练习与作答情况，用于衔接学习进度。</li>
              <li>设备信息：浏览器类型与屏幕尺寸等，仅用于保证页面正常显示。</li>
              <li>我们不收集身份证件、家庭住址、联系电话等与学习无关的个人信息。</li>
            </ul>
          </section>

          <section class="section">
            <h2 class="section-title">信息如何被使用</h2>
            <p>学习记录只用于一个目的：让下一次学习从上一次停止的地方继续。</p>
            <p>我们不会将你的学习数据出售给任何第三方，也不会用于与学习无关的商业用途。</p>
          </section>

          <section class="section">
            <h2 class="section-title">信息如何被保护</h2>
            <p>数据通过加密连接传输，并在受控的服务环境中存储。只有维护服务运行所必需的人员，才可能在故障处理时有限度地接触数据。</p>
          </section>

          <section class="section">
            <h2 class="section-title">你的权利</h2>
            <p>你可以要求查询、更正或删除与你相关的学习数据。如有需要，请通过页面底部的联系方式与我们取得联系，我们会在合理期限内处理。</p>
          </section>

          <section class="section">
            <h2 class="section-title">政策更新</h2>
            <p>当本政策发生实质变化时，我们会在页面中显著提示。继续使用本平台，即表示你了解并接受更新后的政策。</p>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * 隐私政策页 - 产品信息页面
 *
 * 视觉：与首页共享设计系统（黑白灰、结构线、大留白），不做纸张背景。
 */
useHead({ title: '隐私政策 · Dexin Labs' })
</script>

<style scoped>
.page {
  width: 100%;
  padding-inline: var(--spacing-lg);
}

.container {
  max-width: 860px;
  margin-inline: auto;
}

.header {
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
}

.label {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.updated {
  margin: var(--spacing-sm) 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.body {
  padding: 0 0 var(--spacing-3xl);
}

.content {
  max-width: 680px;
  margin: 0 auto;
}

.section {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-xl) 0;
}

.section:last-child {
  padding-bottom: 0;
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}

.section p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.85;
  margin: 0 0 var(--spacing-md);
}

.section p:last-child {
  margin-bottom: 0;
}

.list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-md) 0 0;
}

.list li {
  padding: var(--spacing-sm) 0 var(--spacing-sm) 1.5rem;
  position: relative;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.75;
}

.list li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .page {
    padding-inline: var(--spacing-md);
  }

  .header {
    padding: var(--spacing-2xl) 0 var(--spacing-xl);
  }

  .section {
    padding: var(--spacing-lg) 0;
  }
}
</style>
