<template>
  <div class="admin-edit">
    <div class="admin-edit__head">
      <NuxtLink to="/admin/chapters" class="admin-list__back">← 章节列表</NuxtLink>
      <h1 class="admin-edit__title">新建章节 Chapter</h1>
    </div>
    <ChapterForm :model-value="form" :is-new="true" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useHead, useRouter } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '新建章节 · Admin' })
const { createResource } = useAdmin()
const router = useRouter()
const saving = ref(false)
const form = reactive<{
  slug: string; title: string; course: string; summary: string; cover: string; body: string; order: number
}>({ slug: '', title: '', course: '', summary: '', cover: '', body: '', order: 0 })

async function onSubmit(payload: Record<string, unknown>) {
  saving.value = true
  try {
    const r = await createResource('chapter', payload)
    if (r.ok && r.data) {
      const slug = String((r.data as Record<string, unknown>).slug || '')
      router.push(slug ? `/admin/chapters/${encodeURIComponent(slug)}` : '/admin/chapters')
    } else alert('创建失败')
  } finally { saving.value = false }
}
</script>

<style scoped>@import '../_shared-admin.css';</style>
