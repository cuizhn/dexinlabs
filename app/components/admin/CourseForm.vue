<template>
  <form class="admin-form" @submit.prevent="handleSubmit">
    <div class="admin-form__row">
      <label class="admin-form__label">Slug</label>
      <input
        v-model="local.slug"
        type="text"
        class="admin-form__input"
        placeholder="e.g. pep-7a"
        :disabled="!isNew"
        required
      />
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">标题</label>
      <input
        v-model="local.title"
        type="text"
        class="admin-form__input"
        placeholder="课程名称"
        required
      />
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">排序</label>
      <input
        v-model.number="local.order"
        type="number"
        class="admin-form__input admin-form__input--sm"
      />
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">Edition</label>
      <input
        v-model="local.edition"
        type="text"
        class="admin-form__input"
        placeholder="e.g. 人教版 2024"
      />
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">封面 URL</label>
      <input
        v-model="local.cover"
        type="text"
        class="admin-form__input"
        placeholder="https://..."
      />
    </div>

    <div class="admin-form__row">
      <label class="admin-form__label">简介</label>
      <textarea
        v-model="local.summary"
        rows="3"
        class="admin-form__textarea"
        placeholder="课程简介（Markdown 可选）"
      />
    </div>

    <div class="admin-form__row admin-form__row--actions">
      <NuxtLink v-if="!isNew" to="/admin/courses" class="admin-btn admin-btn--ghost">返回列表</NuxtLink>
      <button type="submit" class="admin-btn admin-btn--primary" :disabled="saving">
        {{ saving ? '保存中...' : (isNew ? '创建' : '保存修改') }}
      </button>
    </div>

    <p v-if="error" class="admin-form__error">错误：{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

interface CourseFormState {
  slug: string
  title: string
  summary: string
  cover: string
  edition: string
  body: string
  order: number
}

const props = defineProps<{
  modelValue: Partial<CourseFormState>
  isNew?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: CourseFormState & Record<string, unknown>): void
}>()

const isNew = props.isNew ?? false
const saving = ref(false)
const error = ref('')

const local = reactive<CourseFormState>({
  slug: '',
  title: '',
  summary: '',
  cover: '',
  edition: '',
  body: '',
  order: 0
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      ;(Object.keys(local) as (keyof CourseFormState)[]).forEach(k => {
        const v = val[k]
        if (v !== undefined) {
          ;(local[k] as unknown) = v as CourseFormState[typeof k]
        }
      })
    }
  },
  { immediate: true, deep: true }
)

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
.admin-form { display: flex; flex-direction: column; gap: var(--spacing-md); max-width: 720px; }
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
