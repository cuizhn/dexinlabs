<template>
  <div class="admin-list">
    <div class="admin-list__head">
      <div>
        <NuxtLink to="/admin" class="admin-list__back">← 后台首页</NuxtLink>
        <h1 class="admin-list__title">课时管理 Lesson</h1>
      </div>
      <NuxtLink to="/admin/lessons/new" class="admin-btn admin-btn--primary">+ 新建课时</NuxtLink>
    </div>

    <p v-if="loading" class="admin-list__state">加载中...</p>
    <p v-else-if="err" class="admin-list__state admin-list__state--err">加载失败：{{ err }}</p>
    <table v-else class="admin-table">
      <thead>
        <tr><th>标题</th><th>slug</th><th>chapter</th><th>排序</th><th>更新</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-if="list.length === 0"><td colspan="6" class="admin-table__empty">暂无课时</td></tr>
        <tr v-for="(row, i) in list" :key="String(row.id ?? row.slug ?? i)">
          <td class="admin-table__title-cell">{{ String(row.title || '') }}</td>
          <td><code>{{ String(row.slug || '') }}</code></td>
          <td><code>{{ String(row.chapter || '—') }}</code></td>
          <td>{{ Number(row.order ?? 0) }}</td>
          <td>{{ fmt(row.updatedAt) }}</td>
          <td class="admin-table__actions">
            <NuxtLink :to="`/admin/lessons/${encodeURIComponent(String(row.slug))}`" class="admin-link">编辑</NuxtLink>
            <button class="admin-link admin-link--danger" @click="onDelete(row)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHead } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '课时管理 · Admin' })
const { listLessons, removeResource } = useAdmin()
const list = ref<Record<string, unknown>[]>([])
const loading = ref(true); const err = ref('')

function fmt(d: unknown): string {
  if (!d) return '—'
  try { return new Date(d as string | number | Date).toLocaleString() } catch { return '—' }
}

async function load() {
  loading.value = true; err.value = ''
  try {
    const resp = await listLessons()
    list.value = (resp?.data && Array.isArray(resp.data)) ? resp.data as Record<string, unknown>[] : []
  } catch (e: unknown) { err.value = e instanceof Error ? e.message : String(e) }
  finally { loading.value = false }
}

async function onDelete(row: Record<string, unknown>) {
  const slug = String(row.slug || '')
  if (!slug) return
  if (!confirm(`确定删除课时：${String(row.title)} (${slug})？`)) return
  const r = await removeResource('lesson', slug)
  if (r.ok) await load(); else alert('删除失败')
}

onMounted(load)
</script>

<style scoped>@import '../_shared-admin.css';</style>
