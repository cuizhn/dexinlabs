<template>
  <div class="admin-root">
    <div class="admin-root__inner">
      <header class="admin-root__header">
        <div>
          <p class="admin-root__eyebrow">DexinLabs / 开发者后台 V1</p>
          <h1 class="admin-root__title">后台管理</h1>
          <p class="admin-root__subtitle">数据库可视化增删查改 · 仅 Markdown 存入库 · 零登录权限</p>
        </div>
        <NuxtLink to="/" class="admin-root__back">← 返回前台首页</NuxtLink>
      </header>

      <div class="admin-grid">
        <NuxtLink to="/admin/courses" class="admin-card">
          <div class="admin-card__ico admin-card__ico--course">📘</div>
          <div class="admin-card__body">
            <h2 class="admin-card__title">课程管理</h2>
            <p class="admin-card__desc">Course · 课程列表 / 新建 / 编辑 / 删除</p>
          </div>
          <div class="admin-card__arrow">→</div>
        </NuxtLink>

        <NuxtLink to="/admin/chapters" class="admin-card">
          <div class="admin-card__ico admin-card__ico--chapter">📑</div>
          <div class="admin-card__body">
            <h2 class="admin-card__title">章节管理</h2>
            <p class="admin-card__desc">Chapter · 课程下的章节树组织</p>
          </div>
          <div class="admin-card__arrow">→</div>
        </NuxtLink>

        <NuxtLink to="/admin/lessons" class="admin-card admin-card--feature">
          <div class="admin-card__ico admin-card__ico--lesson">✏️</div>
          <div class="admin-card__body">
            <h2 class="admin-card__title">课时管理</h2>
            <p class="admin-card__desc">
              Lesson · 集成 @editor 编辑器 + Markdown Engine 实时预览<br />
              支持自动保存、自定义块命令、图片上传
            </p>
          </div>
          <div class="admin-card__arrow">→</div>
        </NuxtLink>

        <NuxtLink to="/admin/exercises" class="admin-card">
          <div class="admin-card__ico admin-card__ico--exercise">🧩</div>
          <div class="admin-card__body">
            <h2 class="admin-card__title">练习管理</h2>
            <p class="admin-card__desc">Exercise · 章节配套题目（题干/提示/答案/解析）</p>
          </div>
          <div class="admin-card__arrow">→</div>
        </NuxtLink>
      </div>

      <footer class="admin-root__footer">
        <p>Admin V1 · 严格遵循 Page → Composable → API → Service → Repository → Drizzle → Neon 分层</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
useHead({ title: '后台管理 · DexinLabs' })
</script>

<style scoped>
.admin-root { min-height: calc(100vh - 64px); background-color: var(--color-bg-secondary); padding: var(--spacing-2xl) var(--spacing-lg); }
.admin-root__inner { max-width: 1100px; margin: 0 auto; }
.admin-root__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-lg); margin-bottom: var(--spacing-2xl); flex-wrap: wrap; }
.admin-root__eyebrow { margin: 0 0 var(--spacing-md); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-primary); }
.admin-root__title { margin: 0 0 6px; font-size: 2.25rem; font-weight: 800; color: var(--color-text-primary); letter-spacing: -0.02em; }
.admin-root__subtitle { margin: 0; font-size: 1rem; color: var(--color-text-secondary); }
.admin-root__back { text-decoration: none; color: var(--color-text-secondary); font-size: 0.875rem; font-weight: 500; padding: 6px 14px; border: 1px solid var(--color-border); border-radius: 100px; background-color: var(--color-bg-white); transition: all 0.2s ease; }
.admin-root__back:hover { color: var(--color-primary); border-color: var(--color-primary); }
.admin-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-lg); margin-bottom: var(--spacing-2xl); }
.admin-card { display: flex; align-items: center; gap: var(--spacing-lg); padding: var(--spacing-xl); background-color: var(--color-bg-white); border: 1px solid var(--color-border); border-radius: var(--border-radius-xl); text-decoration: none; color: inherit; transition: all 0.25s ease; cursor: pointer; position: relative; overflow: hidden; }
.admin-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(79,70,229,0.02), transparent 50%); opacity: 0; transition: opacity 0.25s ease; pointer-events: none; }
.admin-card:hover { transform: translateY(-4px); border-color: var(--color-primary); box-shadow: var(--shadow-lg); }
.admin-card:hover::after { opacity: 1; }
.admin-card--feature { grid-column: span 2; background: linear-gradient(135deg, #fff 0%, #eef2ff 100%); border-color: rgba(99,102,241,0.2); }
.admin-card__ico { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border-radius: var(--border-radius-lg); flex-shrink: 0; position: relative; z-index: 1; }
.admin-card__ico--course { background-color: #ecfeff; }
.admin-card__ico--chapter { background-color: #fff7ed; }
.admin-card__ico--lesson { background-color: #eef2ff; }
.admin-card__ico--exercise { background-color: #f0fdf4; }
.admin-card__body { flex: 1; min-width: 0; position: relative; z-index: 1; }
.admin-card__title { margin: 0 0 4px; font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); }
.admin-card__desc { margin: 0; font-size: 0.875rem; line-height: 1.6; color: var(--color-text-secondary); }
.admin-card__arrow { font-size: 1.25rem; color: var(--color-text-light); transition: all 0.25s ease; position: relative; z-index: 1; }
.admin-card:hover .admin-card__arrow { color: var(--color-primary); transform: translateX(4px); }
.admin-root__footer { padding-top: var(--spacing-lg); border-top: 1px dashed var(--color-border); color: var(--color-text-light); font-size: 0.8125rem; text-align: center; }
@media (max-width: 768px) {
  .admin-grid { grid-template-columns: 1fr; }
  .admin-card--feature { grid-column: span 1; }
  .admin-root__title { font-size: 1.75rem; }
}
</style>
