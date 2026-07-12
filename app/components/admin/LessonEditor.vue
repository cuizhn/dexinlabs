<template>
  <div class="lesson-editor">
    <div class="lesson-editor__status-bar">
      <span class="lesson-editor__status">
        <span class="lesson-editor__dot" :class="statusDotCls"></span>
        {{ status }}
      </span>
      <span v-if="lastSaved" class="lesson-editor__saved">上次保存：{{ lastSavedText }}</span>
      <span v-if="capVendor" class="lesson-editor__cap">引擎：{{ capVendor }}（math={{ capMath }}）</span>
    </div>

    <div class="lesson-editor__grid">
      <section class="lesson-editor__panel">
        <div class="lesson-editor__panel-head">
          <h3 class="lesson-editor__panel-title">正文 body（Markdown）</h3>
          <div class="lesson-editor__cmd-bar">
            <button type="button" class="lesson-editor__cmd" @click="cmd('insert:definition')">定义块</button>
            <button type="button" class="lesson-editor__cmd" @click="cmd('insert:theorem')">定理块</button>
            <button type="button" class="lesson-editor__cmd" @click="cmd('insert:exercise')">练习占位</button>
            <button type="button" class="lesson-editor__cmd" @click="cmd('insert:formula')">公式 $$</button>
          </div>
        </div>
        <div ref="bodyEditorRef" class="lesson-editor__editor-slot"></div>
      </section>

      <section class="lesson-editor__panel">
        <div class="lesson-editor__panel-head">
          <h3 class="lesson-editor__panel-title">Markdown Engine 实时预览（与前台渲染一致）</h3>
        </div>
        <div
          class="lesson-editor__preview markdown-body"
          v-html="previewHTML"
        ></div>
      </section>
    </div>

    <div class="lesson-editor__sub-panel">
      <div class="lesson-editor__sub-row">
        <label class="lesson-editor__label">章节总结 summaryText（Markdown）</label>
        <textarea
          v-model="summaryTextLocal"
          rows="3"
          class="lesson-editor__textarea"
          placeholder="总结性 Markdown（可选）"
          @input="onMetaInput"
        />
      </div>
      <div class="lesson-editor__sub-row">
        <label class="lesson-editor__label">教师备注 notes（Markdown，不公开）</label>
        <textarea
          v-model="notesLocal"
          rows="3"
          class="lesson-editor__textarea"
          placeholder="教师端内部备注（Markdown）"
          @input="onMetaInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch, onMounted } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import { createEditor } from '@editor'
import type { EditorInstance } from '@editor'
import { createUploadHandler } from '@storage'

const props = defineProps<{
  body?: string
  notes?: string
  summaryText?: string
}>()

const emit = defineEmits<{
  (e: 'update:body', value: string): void
  (e: 'update:notes', value: string): void
  (e: 'update:summaryText', value: string): void
  (e: 'change', payload: { body: string; notes: string; summaryText: string }): void
  (e: 'autosave', payload: { body: string; notes: string; summaryText: string }): void
}>()

const bodyEditorRef = ref<HTMLDivElement | null>(null)
const summaryTextLocal = ref(props.summaryText || '')
const notesLocal = ref(props.notes || '')
const bodyLocal = ref(props.body || '')
const previewHTML = ref('')
const status = ref('初始化中...')
const statusDotCls = ref('')
const lastSaved = ref<Date | null>(null)
const capVendor = ref('')
const capMath = ref(false)
const editorInstance = shallowRef<EditorInstance | null>(null)

const lastSavedText = computed(() => {
  if (!lastSaved.value) return '—'
  const d = lastSaved.value
  return d.toLocaleTimeString()
})

watch(
  () => props.body,
  v => {
    if (v !== undefined && v !== bodyLocal.value && !editorInstance.value?.isCreated()) {
      bodyLocal.value = v
    }
  },
  { immediate: true }
)
watch(() => props.notes, v => { if (v !== undefined) notesLocal.value = v }, { immediate: true })
watch(() => props.summaryText, v => { if (v !== undefined) summaryTextLocal.value = v }, { immediate: true })

let __lastEmitBody = ''

async function refreshPreview(md: string) {
  try {
    const nuxtApp = useNuxtApp()
    const renderToHTML = (nuxtApp as unknown as { $renderToHTML?: (md: string, opts?: Record<string, unknown>) => Promise<string> | string }).$renderToHTML
    if (typeof renderToHTML === 'function') {
      const html = await renderToHTML(md, { math: true })
      previewHTML.value = typeof html === 'string' ? html : ''
    } else {
      previewHTML.value = escapeForPreview(md).replace(/\n/g, '<br/>')
    }
  } catch {
    previewHTML.value = escapeForPreview(md).replace(/\n/g, '<br/>')
  }
}

function escapeForPreview(s: string): string {
  return String(s || '').replace(/[&<>]/g, ch => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : '&gt;'))
}

watch(bodyLocal, v => {
  refreshPreview(v)
  if (v !== __lastEmitBody) {
    __lastEmitBody = v
    emit('update:body', v)
    emit('change', currentPayload())
  }
}, { immediate: true })

function currentPayload() {
  return {
    body: bodyLocal.value,
    notes: notesLocal.value,
    summaryText: summaryTextLocal.value
  }
}

function onMetaInput() {
  emit('update:notes', notesLocal.value)
  emit('update:summaryText', summaryTextLocal.value)
  emit('change', currentPayload())
}

async function cmd(name: 'insert:definition' | 'insert:theorem' | 'insert:exercise' | 'insert:formula') {
  if (!editorInstance.value) return
  await editorInstance.value.executeCommand(name)
}

let __attachTried = false

async function ensureEditorAttached() {
  if (__attachTried) return
  if (!bodyEditorRef.value) return
  __attachTried = true
  status.value = '加载编辑器...'
  statusDotCls.value = 'is-pending'

  try {
    const upload = createUploadHandler()
    const editor = createEditor({ provider: 'vditor', autoSave: { enabled: true, delay: 3000 } })
    editor.onChange(md => {
      if (md !== bodyLocal.value) {
        bodyLocal.value = md
      }
    })
    editor.onSave(async () => {
      lastSaved.value = new Date()
      status.value = '自动保存（本地 emit）'
      statusDotCls.value = 'is-ok'
      emit('autosave', currentPayload())
    })

    await editor.create({
      container: bodyEditorRef.value,
      initialMarkdown: bodyLocal.value || '',
      upload,
      onChange: md => { bodyLocal.value = md }
    })

    if (editor.capability) {
      capVendor.value = String(editor.capability.vendor || '')
      capMath.value = Boolean(editor.capability.supportsMath)
    }

    editorInstance.value = editor
    status.value = '已就绪'
    statusDotCls.value = 'is-ok'
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    status.value = `编辑器加载失败（SSR/无 DOM 时正常）：${msg}`
    statusDotCls.value = 'is-err'
  }
}

onMounted(async () => {
  await nextTick()
  await ensureEditorAttached()
})

onBeforeUnmount(async () => {
  const inst = editorInstance.value
  editorInstance.value = null
  if (inst) {
    try { await inst.destroy() } catch { /* noop */ }
  }
})
</script>

<style scoped>
.lesson-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-white);
}
.lesson-editor__status-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px dashed var(--color-border);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}
.lesson-editor__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.lesson-editor__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-text-light);
  display: inline-block;
}
.lesson-editor__dot.is-ok { background-color: #10b981; }
.lesson-editor__dot.is-pending { background-color: #f59e0b; animation: pulse 1.6s infinite; }
.lesson-editor__dot.is-err { background-color: #dc2626; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
.lesson-editor__saved, .lesson-editor__cap { margin-left: auto; }
.lesson-editor__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}
.lesson-editor__panel {
  display: flex;
  flex-direction: column;
  min-height: 420px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background-color: var(--color-bg-white);
}
.lesson-editor__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}
.lesson-editor__panel-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-text-primary);
}
.lesson-editor__cmd-bar { display: flex; gap: 6px; flex-wrap: wrap; }
.lesson-editor__cmd {
  padding: 4px 12px;
  font-size: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-white);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.lesson-editor__cmd:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.lesson-editor__editor-slot {
  flex: 1;
  min-height: 380px;
  width: 100%;
}
.lesson-editor__preview {
  padding: var(--spacing-lg);
  overflow-y: auto;
  max-height: 640px;
  font-size: 0.9375rem;
  line-height: 1.75;
  color: var(--color-text-primary);
  background-color: #fff;
}
.lesson-editor__sub-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}
.lesson-editor__sub-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lesson-editor__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
.lesson-editor__textarea {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-white);
  padding: 10px 14px;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-family: var(--font-mono);
  color: var(--color-text-primary);
  transition: border-color 0.15s ease;
  min-height: 80px;
}
.lesson-editor__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}
@media (max-width: 1024px) {
  .lesson-editor__grid, .lesson-editor__sub-panel { grid-template-columns: 1fr; }
}
</style>
