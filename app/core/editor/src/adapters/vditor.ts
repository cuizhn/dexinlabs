import type {
  EditorAdapter,
  EditorCapability,
  EditorChangeHook,
  EditorCommandContext,
  EditorCommandName,
  EditorCreateOptions,
  EditorLifecycleHook,
  UploadResponse
} from '../types'

type VditorConstructor = new (id: string, options: unknown) => unknown

interface VditorLike {
  getValue(): string
  setValue(value: string): void
  insertValue(value: string, render?: boolean): void
  focus(): void
  blur(): void
  destroy?(): void
}

let __VditorCtor: VditorConstructor | null = null
let __loadPromise: Promise<VditorConstructor | null> | null = null

async function loadVditorConstructor(): Promise<VditorConstructor | null> {
  if (typeof window === 'undefined') return null
  if (__VditorCtor != null) return __VditorCtor
  if (__loadPromise != null) return __loadPromise
  __loadPromise = (async () => {
    try {
      const mod = await import('vditor')
      const ctor = (mod as { default?: VditorConstructor; Vditor?: VditorConstructor })?.Vditor
        ?? (mod as { default?: VditorConstructor })?.default
      if (typeof ctor === 'function') {
        __VditorCtor = ctor
      }
      return __VditorCtor
    } catch {
      return null
    }
  })()
  const result = await __loadPromise
  __loadPromise = null
  return result
}

function buildVditorCapability(): EditorCapability {
  return Object.freeze({
    supportsMath: true,
    supportsMermaid: true,
    supportsImageUpload: true,
    supportsTable: true,
    supportsSlashCommand: false,
    supportsHistory: true,
    supportsRichTextShortcuts: true,
    vendor: 'vditor'
  })
}

export function createVditorAdapter(): EditorAdapter {
  let instance: VditorLike | null = null
  let changeHook: EditorChangeHook | null = null
  let saveHook: EditorLifecycleHook | null = null
  let created = false
  let destroyed = false
  let internalMarkdown = ''

  const resolveMount = (container: string | HTMLElement): { selector: string; idFallback: string } => {
    if (typeof container === 'string') {
      const clean = container.startsWith('#') ? container.slice(1) : container
      return { selector: '#' + clean, idFallback: clean }
    }
    if (typeof container === 'object' && container != null && 'nodeType' in container) {
      const el = container as HTMLElement
      if (el.id && el.id.length > 0) {
        return { selector: '#' + el.id, idFallback: el.id }
      }
      const autoId = 'editor-' + Math.random().toString(36).slice(2, 10)
      el.id = autoId
      return { selector: '#' + autoId, idFallback: autoId }
    }
    return { selector: '#__editor__', idFallback: '__editor__' }
  }

  const insertCustomBlock = async (ctx: EditorCommandContext, kind: string, content = ''): Promise<boolean> => {
    const snippet = content.length > 0
      ? `:::${kind}\n\n${content}\n\n:::\n\n`
      : `:::${kind}\n\n\n\n:::\n\n`
    await ctx.insert(snippet, false)
    return true
  }

  return {
    async create(options: EditorCreateOptions): Promise<void> {
      if (destroyed) {
        throw new Error('[editor:vditor] Adapter already destroyed, create a new one.')
      }
      if (created) return
      const { selector } = resolveMount(options.container)
      internalMarkdown = options.initialMarkdown ?? ''
      if (typeof options.onChange === 'function') changeHook = options.onChange
      if (typeof options.onSave === 'function') saveHook = options.onSave

      const ctor = await loadVditorConstructor()
      if (ctor == null) {
        created = true
        return
      }

      const uploadHandler = options.upload
      const vditorOptions: Record<string, unknown> = {
        value: internalMarkdown,
        placeholder: options.placeholder ?? '',
        theme: options.theme ?? 'classic',
        height: options.height ?? '100%',
        mode: options.mode ?? 'ir',
        cache: options.cache ?? { enable: false },
        toolbar: options.toolbar ?? true,
        preview: options.preview ?? {
          delay: 500,
          maxWidth: 800,
          mode: 'both',
          hljs: { enable: true, lineNumber: true, style: 'github' },
          math: { enable: true, engine: 'KaTeX' },
          mermaid: { enable: true }
        },
        input: (val: string) => {
          internalMarkdown = val
          if (changeHook) {
            try { changeHook(val) } catch {
            }
          }
        },
        blur: () => {
          if (saveHook) {
            try { void saveHook(internalMarkdown) } catch {
            }
          }
        },
        upload: uploadHandler ? {
          accept: 'image/*',
          handler(files: File[]): UploadResponse[] | Promise<UploadResponse[]> {
            return uploadHandler(files)
          }
        } : undefined
      }

      for (const [k, v] of Object.entries(options.extraAdapters ?? {})) {
        vditorOptions[k] = v
      }

      for (const [k, v] of Object.entries(options)) {
        if (!(k in vditorOptions)
          && k !== 'container'
          && k !== 'initialMarkdown'
          && k !== 'onChange'
          && k !== 'onSave'
          && k !== 'upload'
          && k !== 'extraAdapters') {
          vditorOptions[k] = v
        }
      }

      try {
        instance = new ctor(selector, vditorOptions) as VditorLike
        created = true
      } catch {
        instance = null
        created = true
      }
    },

    async destroy(): Promise<void> {
      if (destroyed) return
      destroyed = true
      created = false
      const inst = instance
      instance = null
      changeHook = null
      saveHook = null
      if (inst && typeof (inst as { destroy?(): unknown }).destroy === 'function') {
        try {
          (inst as { destroy(): unknown }).destroy()
        } catch {
        }
      }
    },

    async getMarkdown(): Promise<string> {
      if (instance != null && typeof instance.getValue === 'function') {
        try { internalMarkdown = instance.getValue() } catch {
        }
      }
      return internalMarkdown
    },

    async setMarkdown(md: string): Promise<void> {
      internalMarkdown = md
      if (instance != null && typeof instance.setValue === 'function') {
        try { instance.setValue(md); return } catch {
        }
      }
    },

    async insert(text: string, replace: boolean = false): Promise<void> {
      if (replace) { await this.setMarkdown(text); return }
      if (instance != null && typeof instance.insertValue === 'function') {
        try { instance.insertValue(text, true); internalMarkdown = await this.getMarkdown(); return } catch {
        }
      }
      internalMarkdown += text
    },

    async focus(): Promise<void> {
      if (instance != null && typeof instance.focus === 'function') {
        try { instance.focus() } catch {
        }
      }
    },

    async blur(): Promise<void> {
      if (instance != null && typeof instance.blur === 'function') {
        try { instance.blur() } catch {
        }
      }
    },

    onChange(hook: EditorChangeHook): void { changeHook = hook },

    onSave(hook: EditorLifecycleHook): void { saveHook = hook },

    isCreated(): boolean {
      return created && !destroyed
    },

    reportCapabilities(): EditorCapability {
      return buildVditorCapability()
    },

    async executeCommand(
      name: EditorCommandName,
      context: EditorCommandContext,
      payload?: unknown
    ): Promise<boolean> {
      const p = payload as { content?: string } | undefined
      const content = (p && typeof p.content === 'string') ? p.content : ''
      switch (name) {
        case 'insert:definition':
        case 'definition':
          return insertCustomBlock(context, 'definition', content)
        case 'insert:theorem':
        case 'theorem':
          return insertCustomBlock(context, 'theorem', content)
        case 'insert:exercise':
        case 'exercise':
          return insertCustomBlock(context, 'exercise', content)
        case 'insert:formula':
        case 'formula': {
          const tex = typeof payload === 'string' ? payload : content
          const snippet = tex.length > 0 ? `$$\n${tex}\n$$\n\n` : '$$\n\n\n\n$$\n\n'
          await context.insert(snippet, false)
          return true
        }
        case 'insert:image':
        case 'image': {
          const r = payload as { url?: string; name?: string } | undefined
          const url = (r && typeof r.url === 'string') ? r.url : ''
          const name = (r && typeof r.name === 'string') ? r.name : 'image'
          if (url.length === 0) return false
          await context.insert(`![${name}](${url})\n\n`, false)
          return true
        }
        case 'insert:markdown': {
          const text = typeof payload === 'string' ? payload : content
          if (text.length === 0) return false
          await context.insert(text, false)
          return true
        }
        default:
          return false
      }
    }
  }
}

export default createVditorAdapter
