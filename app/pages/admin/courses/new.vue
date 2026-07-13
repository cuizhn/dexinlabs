<template>
  <div class="admin-edit">
    <div class="admin-edit__head">
      <NuxtLink to="/admin/courses" class="admin-list__back">← 课程列表</NuxtLink>
      <h1 class="admin-edit__title">新建课程 Course</h1>
    </div>
    <AdminCourseForm :model-value="form" :is-new="true" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useHead, useRouter } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '新建课程 · Admin' })
const { createResource } = useAdmin()
const router = useRouter()
const saving = ref(false)

const form = reactive<{
  slug: string; title: string; summary: string; cover: string; edition: string; body: string; order: number
}>({ slug: '', title: '', summary: '', cover: '', edition: '', body: '', order: 0 })

async function onSubmit(payload: Record<string, unknown>) {
  saving.value = true
  try {
    const r = await createResource('course', payload)
    if (r.ok && r.data) {
      const slug = String((r.data as Record<string, unknown>).slug || '')
      router.push(slug ? `/admin/courses/${encodeURIComponent(slug)}` : '/admin/courses')
    } else alert('创建失败，请检查 slug 是否重复或必填字段是否填写')
  } finally { saving.value = false }
}
</script>

<style scoped>@import '../_shared-admin.css';</style>
