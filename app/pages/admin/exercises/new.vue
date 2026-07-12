<template>
  <div class="admin-edit">
    <div class="admin-edit__head">
      <NuxtLink to="/admin/exercises" class="admin-list__back">← 练习列表</NuxtLink>
      <h1 class="admin-edit__title">新建练习 Exercise</h1>
    </div>
    <ExerciseForm :model-value="form" :is-new="true" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useHead, useRouter } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '新建练习 · Admin' })
const { createResource } = useAdmin()
const router = useRouter()
const saving = ref(false)
const form = reactive<{
  slug: string; title: string; chapter: string; summary: string; description: string;
  body: string; hint: string; answer: string; analysis: string; order: number
}>({ slug: '', title: '', chapter: '', summary: '', description: '', body: '', hint: '', answer: '', analysis: '', order: 0 })

async function onSubmit(payload: Record<string, unknown>) {
  saving.value = true
  try {
    const r = await createResource('exercise', payload)
    if (r.ok && r.data) {
      const slug = String((r.data as Record<string, unknown>).slug || '')
      router.push(slug ? `/admin/exercises/${encodeURIComponent(slug)}` : '/admin/exercises')
    } else alert('创建失败')
  } finally { saving.value = false }
}
</script>

<style scoped>@import '../_shared-admin.css';</style>
