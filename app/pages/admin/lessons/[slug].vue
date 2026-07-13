<template>
  <div class="admin-edit">
    <div class="admin-edit__head">
      <NuxtLink to="/admin/lessons" class="admin-list__back">← 课时列表</NuxtLink>
      <div>
        <h1 class="admin-edit__title" style="margin: 0 0 6px;">编辑课时：{{ form.title || slug }}</h1>
        <p v-if="saveHint" class="admin-edit__savehint" :class="{ 'is-ok': saveHint === '已保存' }">{{ saveHint }}</p>
      </div>
    </div>
    <p v-if="loading" class="admin-list__state">加载中...</p>
    <p v-else-if="err && !loadedOk" class="admin-list__state admin-list__state--err">加载失败：{{ err }}</p>
    <AdminLessonForm v-else :model-value="form" :is-new="false" @submit="onSubmit" @change="onAnyChange" @autosave="onAutoSave" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useHead, useRoute, useRouter } from 'nuxt/app'
import { useAdmin } from '~/composables/useAdmin'

useHead({ title: '编辑课时 · Admin' })
const route = useRoute(); const router = useRouter()
const { updateResource } = useAdmin()
const slug = String(route.params.slug || '')
const loading = ref(true); const err = ref(''); const loadedOk = ref(false); const saving = ref(false)
const saveHint = ref('')

interface FormState {
  slug: string; title: string; chapter: string; summary: string; objectives: string;
  intro: string; body: string; summaryText: string; notes: string; order: number
}
const form = reactive<FormState>({
  slug, title: '', chapter: '', summary: '', objectives: '',
  intro: '', body: '', summaryText: '', notes: '', order: 0
})

let __debounceId: ReturnType<typeof setTimeout> | null = null
let __lastSubmittedSnapshot = ''
function snapshot(): string { return JSON.stringify({ ...form }) }

async function flushSave(): Promise<void> {
  saveHint.value = '自动保存中...'
  try {
    const r = await updateResource('lesson', slug, { ...form })
    if (r.ok) { __lastSubmittedSnapshot = snapshot(); saveHint.value = '已保存' }
    else saveHint.value = '保存失败'
  } catch (e: unknown) {
    saveHint.value = '保存失败：' + (e instanceof Error ? e.message : String(e))
  }
}

function scheduleDebouncedSave() {
  if (__debounceId) clearTimeout(__debounceId)
  __debounceId = setTimeout(async () => {
    if (snapshot() === __lastSubmittedSnapshot) { saveHint.value = '已保存'; return }
    await flushSave()
  }, 3000)
}

function onAnyChange(): void { saveHint.value = '有未保存更改'; scheduleDebouncedSave() }
function onAutoSave(_p: Record<string, unknown>): void { void _p; scheduleDebouncedSave() }

onMounted(async () => {
  loading.value = true
  try {
    const r = await $fetch<unknown>(`/api/lesson/${encodeURIComponent(slug)}`) as Record<string, unknown>
    const data = r && typeof r === 'object' && (r as { ok?: unknown }).ok !== true && (r as { slug?: unknown }).slug
      ? (r as Record<string, unknown>)
      : ((r && (r as { data?: Record<string, unknown> }).data) ? (r as { data: Record<string, unknown> }).data : (r as Record<string, unknown>))
    ;(Object.keys(form) as (keyof FormState)[]).forEach(k => {
      const v = data[k]
      if (v !== undefined) {
        ;(form[k] as unknown) = typeof form[k] === 'number' ? Number(v) || 0 : String(v ?? '')
      }
    })
    __lastSubmittedSnapshot = snapshot()
    loadedOk.value = true
    saveHint.value = '已保存'
  } catch (e: unknown) { err.value = e instanceof Error ? e.message : String(e) }
  finally { loading.value = false }
})

onBeforeUnmount(() => { if (__debounceId) clearTimeout(__debounceId) })

async function onSubmit(payload: Record<string, unknown>) {
  saving.value = true
  try {
    if (__debounceId) { clearTimeout(__debounceId); __debounceId = null }
    const r = await updateResource('lesson', slug, payload)
    if (r.ok) router.push('/admin/lessons'); else alert('保存失败')
  } finally { saving.value = false }
}
</script>

<style scoped>
@import '../_shared-admin.css';
.admin-edit__savehint { margin: 0; font-size: 0.8125rem; color: #b45309; font-weight: 500; }
.admin-edit__savehint.is-ok { color: #047857; }
</style>
