<template>
  <div class="admin-edit">
    <div class="admin-edit__head">
      <NuxtLink to="/admin/lessons" class="admin-list__back">← 课时列表</NuxtLink>
      <h1 class="admin-edit__title">新建课时 Lesson</h1>
    </div>
    <LessonForm :model-value="form" :is-new="true" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useHead, useRouter } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '新建课时 · Admin' })
const { createResource } = useAdmin()
const router = useRouter()
const saving = ref(false)
const form = reactive<{
  slug: string; title: string; chapter: string; summary: string; objectives: string;
  intro: string; body: string; summaryText: string; notes: string; order: number
}>({ slug: '', title: '', chapter: '', summary: '', objectives: '', intro: '', body: '', summaryText: '', notes: '', order: 0 })

async function onSubmit(payload: Record<string, unknown>) {
  saving.value = true
  try {
    const r = await createResource('lesson', payload)
    if (r.ok && r.data) {
      const slug = String((r.data as Record<string, unknown>).slug || '')
      router.push(slug ? `/admin/lessons/${encodeURIComponent(slug)}` : '/admin/lessons')
    } else alert('创建失败')
  } finally { saving.value = false }
}
</script>

<style scoped>@import '../_shared-admin.css';</style>
