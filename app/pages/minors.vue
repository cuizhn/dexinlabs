<template>
  <article class="page">
    <header class="header">
      <div class="container">
        <p class="label">政策</p>
        <h1 class="title">未成年人保护政策</h1>
        <p class="updated">最近更新：2026 年 8 月</p>
      </div>
    </header>

    <div class="body">
      <div class="container">
        <div class="content">
          <section class="section">
            <h2 class="section-title">我们的立场</h2>
            <p>得心实验室的主要用户是未成年人。保护未成年人，是产品设计的前提，而不是事后补充的条款。</p>
          </section>

          <section class="section">
            <h2 class="section-title">内容安全</h2>
            <ul class="list">
              <li>全部学习内容围绕课程知识编写，不包含不适龄的信息。</li>
              <li>不提供社交、评论、私信等陌生人接触渠道。</li>
              <li>不展示广告，不引导消费，不设置诱导性奖励机制。</li>
            </ul>
          </section>

          <section class="section">
            <h2 class="section-title">健康使用</h2>
            <p>我们鼓励适度学习，反对长时间连续使用。</p>
            <ul class="list">
              <li>不使用使人沉迷的无限滚动信息流。</li>
              <li>不发送提醒推送，把使用节奏交还给学生与家长。</li>
              <li>单课时长设计以可完整读完为准，鼓励学完即休息。</li>
            </ul>
          </section>

          <section class="section">
            <h2 class="section-title">个人信息保护</h2>
            <p>针对未成年人，我们执行比《隐私政策》更严格的标准：不收集出生日期以外的身份信息，不进行用户画像，不向第三方共享可识别个人的数据。</p>
          </section>

          <section class="section">
            <h2 class="section-title">家长的参与</h2>
            <p>家长有权了解孩子的学习情况，并要求导出或删除相关数据。如有任何疑问或建议，欢迎通过页面底部的联系方式与我们沟通也行。</p>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * 未成年人保护政策页 - 产品信息页面
 *
 * 视觉：与首页共享设计系统（黑白灰、结构线、大留白），不做纸张背景。
 */
useHead({ title: '未成年人保护政策 · Dexin Labs' })
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
  border: 1px solid var(--color-border);
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
