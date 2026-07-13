<template>
  <div class="admin-edit">
    <div class="admin-edit__head">
      <NuxtLink to="/admin/courses" class="admin-list__back">← 课程列表</NuxtLink>
      <h1 class="admin-edit__title">编辑课程：{{ form.title || slug }}</h1>
    </div>
    <p v-if="loading" class="admin-list__state">加载中...</p>
    <p v-else-if="err && !loadedOk" class="admin-list__state admin-list__state--err">加载失败：{{ err }}</p>
    <AdminCourseForm v-else :model-value="form" :is-new="false" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useHead, useRoute, useRouter } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '编辑课程 · Admin' })
const route = useRoute(); const router = useRouter()
const { updateResource } = useAdmin()
const slug = String(route.params.slug || '')
const loadedOk = ref(false); const loading = ref(true); const err = ref(''); const saving = ref(false)

const form = reactive<{
  slug: string; title: string; summary: string; cover: string; edition: string; body: string; order: number
}>({ slug, title: '', summary: '', cover: '', edition: '', body: '', order: 0 })

onMounted(async () => {
  loading.value = true
  try {
    const r = await $fetch<unknown>(`/api/course/${encodeURIComponent(slug)}`) as Record<string, unknown>
    const data = r && typeof r === 'object' && !Array.isArray(r) && (r as { ok?: unknown }).ok !== true
      ? (r as Record<string, unknown>)
      : ((r && (r as { data?: Record<string, unknown> }).data) ? (r as { data: Record<string, unknown> }).data : (r as Record<string, unknown>))
    ;(Object.keys(form) as (keyof typeof form)[]).forEach(k => {
      const v = data[k]
      if (v !== undefined) {
        ;(form[k] as unknown) = typeof form[k] === 'number' ? Number(v) || 0 : String(v ?? '')
      }
    })
    loadedOk.value = true
  } catch (e: unknown) { err.value = e instanceof Error ? e.message : String(e) }
  finally { loading.value = false }
})

async function onSubmit(payload: Record<string, unknown>) {
  saving.value = true
  try {
    const r = await updateResource('course', slug, payload)
    if (r.ok) router.push('/admin/courses'); else alert('保存失败')
  } finally { saving.value = false }
}
</script>

<style scoped>@import '../_shared-admin.css';</style>
