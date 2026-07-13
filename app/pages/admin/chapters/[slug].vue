<template>
  <div class="admin-edit">
    <div class="admin-edit__head">
      <NuxtLink to="/admin/chapters" class="admin-list__back">← 章节列表</NuxtLink>
      <h1 class="admin-edit__title">编辑章节：{{ form.title || slug }}</h1>
    </div>
    <p v-if="loading" class="admin-list__state">加载中...</p>
    <p v-else-if="err && !loadedOk" class="admin-list__state admin-list__state--err">加载失败：{{ err }}</p>
    <AdminChapterForm v-else :model-value="form" :is-new="false" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useHead, useRoute, useRouter } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '编辑章节 · Admin' })
const route = useRoute(); const router = useRouter()
const { updateResource } = useAdmin()
const slug = String(route.params.slug || '')
const loading = ref(true); const err = ref(''); const loadedOk = ref(false); const saving = ref(false)
const form = reactive<{
  slug: string; title: string; course: string; summary: string; cover: string; body: string; order: number
}>({ slug, title: '', course: '', summary: '', cover: '', body: '', order: 0 })

onMounted(async () => {
  loading.value = true
  try {
    const r = await $fetch<unknown>(`/api/chapter/${encodeURIComponent(slug)}`) as Record<string, unknown>
    const data = r && typeof r === 'object' && (r as { ok?: unknown }).ok !== true && (r as { slug?: unknown }).slug
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
    const r = await updateResource('chapter', slug, payload)
    if (r.ok) router.push('/admin/chapters'); else alert('保存失败')
  } finally { saving.value = false }
}
</script>

<style scoped>@import '../_shared-admin.css';</style>
