<template>
  <form class="admin-form" @submit.prevent="handleSubmit">
    <div class="admin-form__grid">
      <div class="admin-form__row">
        <label class="admin-form__label">Slug</label>
        <input v-model="local.slug" type="text" class="admin-form__input" placeholder="e.g. l-01-equation" :disabled="!isNew" required />
      </div>
      <div class="admin-form__row">
        <label class="admin-form__label">标题</label>
        <input v-model="local.title" type="text" class="admin-form__input" placeholder="课时标题" required />
      </div>
      <div class="admin-form__row">
        <label class="admin-form__label">所属章节 (chapter slug)</label>
        <input v-model="local.chapter" type="text" class="admin-form__input" placeholder="e.g. algebra-1" />
      </div>
      <div class="admin-form__row">
        <label class="admin-form__label">排序</label>
        <input v-model.number="local.order" type="number" class="admin-form__input admin-form__input--sm" />
      </div>
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">学习目标 objectives</label>
      <textarea v-model="local.objectives" rows="2" class="admin-form__textarea" placeholder="Markdown 列表格式" />
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">导入 intro</label>
      <textarea v-model="local.intro" rows="2" class="admin-form__textarea" placeholder="引入段落（Markdown）" />
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">简介 summary</label>
      <textarea v-model="local.summary" rows="2" class="admin-form__textarea" placeholder="列表卡片用简短描述（Markdown）" />
    </div>

    <LessonEditor
      v-model:body="local.body"
      v-model:notes="local.notes"
      v-model:summaryText="local.summaryText"
      @change="onEditorChange"
      @autosave="onEditorAutosave"
    />

    <div class="admin-form__row admin-form__row--actions">
      <NuxtLink v-if="!isNew" to="/admin/lessons" class="admin-btn admin-btn--ghost">返回列表</NuxtLink>
      <button type="submit" class="admin-btn admin-btn--primary" :disabled="saving">
        {{ saving ? '保存中...' : (isNew ? '创建' : '保存修改') }}
      </button>
    </div>

    <p v-if="error" class="admin-form__error">错误：{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

interface LessonFormState {
  slug: string; title: string; chapter: string; summary: string; objectives: string;
  intro: string; body: string; summaryText: string; notes: string; order: number
}
type LessonPayload = LessonFormState & Record<string, unknown>

const props = defineProps<{
  modelValue: Partial<LessonFormState>
  isNew?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: LessonPayload): void
  (e: 'change', payload: LessonPayload): void
  (e: 'autosave', payload: LessonPayload): void
}>()

const isNew = props.isNew ?? false
const saving = ref(false)
const error = ref('')

const local = reactive<LessonFormState>({
  slug: '', title: '', chapter: '', summary: '', objectives: '',
  intro: '', body: '', summaryText: '', notes: '', order: 0
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      (Object.keys(local) as (keyof LessonFormState)[]).forEach(k => {
        const v = val[k]
        if (v !== undefined) {
          ;(local[k] as unknown) = v as LessonFormState[typeof k]
        }
      })
    }
  },
  { immediate: true, deep: true }
)

function onEditorChange(p: { body: string; notes: string; summaryText: string }) {
  emit('change', { ...local, ...p })
}

function onEditorAutosave(p: { body: string; notes: string; summaryText: string }) {
  emit('autosave', { ...local, ...p })
}

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    emit('submit', { ...local })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-form { display: flex; flex-direction: column; gap: var(--spacing-md); max-width: 100%; }
.admin-form__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
@media (max-width: 768px) { .admin-form__grid { grid-template-columns: 1fr; } }
.admin-form__row { display: flex; flex-direction: column; gap: 6px; }
.admin-form__label { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
.admin-form__input, .admin-form__textarea {
  border: 1px solid var(--color-border); background-color: var(--color-bg-white); padding: 10px 14px;
  border-radius: var(--border-radius-md); font-size: 0.9375rem; color: var(--color-text-primary);
  transition: border-color 0.15s ease; font-family: inherit;
}
.admin-form__input:focus, .admin-form__textarea:focus {
  outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
}
.admin-form__input--sm { width: 160px; }
.admin-form__row--actions { flex-direction: row; align-items: center; justify-content: flex-end; gap: var(--spacing-md); margin-top: var(--spacing-lg); }
.admin-btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 22px; border-radius: var(--border-radius-md); font-weight: 600; font-size: 0.9375rem; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: all 0.2s ease; font-family: inherit; }
.admin-btn--primary { background: linear-gradient(135deg, var(--color-primary), #6366f1); color: #fff; box-shadow: 0 3px 10px rgba(79,70,229,0.2); }
.admin-btn--primary:hover { transform: translateY(-1px); }
.admin-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.admin-btn--ghost { background-color: var(--color-bg-white); color: var(--color-text-secondary); border-color: var(--color-border); }
.admin-btn--ghost:hover { color: var(--color-primary); border-color: var(--color-primary); }
.admin-form__error { color: #dc2626; font-size: 0.875rem; margin: 0; padding: var(--spacing-md); background-color: #fef2f2; border-radius: var(--border-radius-md); border: 1px solid #fecaca; }
</style>
