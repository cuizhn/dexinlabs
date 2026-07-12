import type {
  EditorAdapter,
  EditorCapability,
  EditorChangeHook,
  EditorCommandContext,
  EditorCommandHandler,
  EditorCommandName,
  EditorCreateOptions,
  EditorInstance,
  EditorLifecycleHook,
  EditorProvider,
  EditorProviderId
} from './types'
import { debounce, DEFAULT_AUTOSAVE_DELAY_MS } from './utils/debounce'
import { createVditorAdapter } from './adapters/vditor'

const providerRegistry = new Map<EditorProviderId, EditorProvider>()
const commandRegistry = new Map<EditorCommandName, EditorCommandHandler>()
const defaultProviderId: EditorProviderId = 'vditor'

function ensureDefaultProviders(): void {
  if (providerRegistry.size === 0) {
    registerEditorProvider({
      id: defaultProviderId,
      createAdapter: () => createVditorAdapter()
    })
  }
}

export function registerEditorProvider(provider: EditorProvider): void {
  if (!provider || typeof provider !== 'object') {
    throw new Error('[editor] registerEditorProvider: provider must be an EditorProvider object')
  }
  if (typeof provider.id !== 'string' || provider.id.length === 0) {
    throw new Error('[editor] registerEditorProvider: provider.id (string, non-empty) is required')
  }
  if (typeof provider.createAdapter !== 'function') {
    throw new Error('[editor] registerEditorProvider: provider.createAdapter() must be a function')
  }
  providerRegistry.set(provider.id, provider)
}

export function listEditorProviders(): EditorProviderId[] {
  ensureDefaultProviders()
  return Array.from(providerRegistry.keys())
}

export interface CreateEditorOptions {
  provider?: EditorProviderId
  autoSave?: { enabled?: boolean; delay?: number }
  _adapter?: EditorAdapter
}

export function createEditor(options: CreateEditorOptions = {} as CreateEditorOptions): EditorInstance {
  ensureDefaultProviders()

  let adapter: EditorAdapter
  if ('_adapter' in options) {
    if (!options._adapter || typeof options._adapter !== 'object') {
      throw new Error('[editor] createEditor: _adapter is set but is not a valid EditorAdapter object.')
    }
    adapter = options._adapter
  } else {
    const pid = options.provider ?? defaultProviderId
    const provider = providerRegistry.get(pid)
    if (!provider) {
      const available = Array.from(providerRegistry.keys()).join(', ')
      throw new Error(
        `[editor] Unknown editor provider: "${pid}". ` +
        `Registered providers: ${available || '(none)'}. ` +
        `Use registerEditorProvider() first.`
      )
    }
    adapter = provider.createAdapter()
  }

  if (!adapter || typeof adapter !== 'object') {
    throw new Error('[editor] createEditor resolved adapter is not valid.')
  }

  const autoSaveEnabled = options.autoSave?.enabled ?? true
  const autoSaveDelay = options.autoSave?.delay ?? DEFAULT_AUTOSAVE_DELAY_MS

  let changeHook: EditorChangeHook | null = null
  let saveHook: EditorLifecycleHook | null = null
  let _capability: EditorCapability | null = null

  const runSave = async () => {
    if (!saveHook || !adapter.isCreated()) return
    try {
      const md = await adapter.getMarkdown()
      await saveHook(md)
    } catch {
    }
  }

  const debouncedSave = debounce((async (_md: string) => {
    await runSave()
  }) as unknown as (...args: unknown[]) => unknown, autoSaveDelay) as unknown as { (md: string): void; cancel(): void; flush(): void }

  const getCapability = (): EditorCapability => {
    if (_capability == null) {
      try {
        _capability = Object.freeze({ ...adapter.reportCapabilities() })
      } catch {
        _capability = Object.freeze({
          supportsMath: false,
          supportsMermaid: false,
          supportsImageUpload: false,
          supportsTable: false,
          supportsSlashCommand: false,
          supportsHistory: false,
          supportsRichTextShortcuts: false,
          vendor: 'unknown'
        })
      }
    }
    return _capability
  }

  const buildCommandContext = (): EditorCommandContext => ({
    getMarkdown: () => adapter.getMarkdown(),
    setMarkdown: (md: string) => adapter.setMarkdown(md),
    insert: (text: string, replace?: boolean) => adapter.insert(text, replace),
    adapter
  })

  const notifyChange = (md: string) => {
    if (changeHook) {
      try { changeHook(md) } catch {
      }
    }
    if (autoSaveEnabled && adapter.isCreated()) {
      debouncedSave(md)
    }
  }

  const self: EditorInstance = {
    async create(opts: EditorCreateOptions): Promise<void> {
      await adapter.create({
        ...opts,
        onChange: (md: string) => {
          if (opts.onChange) {
            try { opts.onChange(md) } catch {
            }
          }
          notifyChange(md)
        },
        onSave: async (md: string) => {
          if (opts.onSave) {
            try { await opts.onSave(md) } catch {
            }
          }
          if (saveHook) {
            try { await saveHook(md) } catch {
            }
          }
        }
      })
    },

    async destroy(): Promise<void> {
      debouncedSave.cancel()
      await adapter.destroy()
    },

    async getMarkdown(): Promise<string> {
      return adapter.getMarkdown()
    },

    async setMarkdown(md: string): Promise<void> {
      await adapter.setMarkdown(md)
    },

    async insert(text: string, replace: boolean = false): Promise<void> {
      await adapter.insert(text, replace)
    },

    async focus(): Promise<void> {
      await adapter.focus()
    },

    async blur(): Promise<void> {
      await adapter.blur()
    },

    onChange(hook: EditorChangeHook): void {
      changeHook = hook
    },

    onSave(hook: EditorLifecycleHook): void {
      saveHook = hook
    },

    isCreated(): boolean {
      return adapter.isCreated()
    },

    getAdapter(): EditorAdapter {
      return adapter
    },

    get capability(): Readonly<EditorCapability> {
      return getCapability()
    },

    registerCommand(name: EditorCommandName, handler: EditorCommandHandler): void {
      if (typeof name !== 'string' || name.length === 0) {
        throw new Error('[editor] registerCommand: name (non-empty string) is required')
      }
      if (typeof handler !== 'function') {
        throw new Error('[editor] registerCommand: handler must be a function')
      }
      commandRegistry.set(name, handler)
    },

    async executeCommand(name: EditorCommandName, payload?: unknown): Promise<boolean> {
      const ctx = buildCommandContext()
      const global = commandRegistry.get(name)
      if (typeof global === 'function') {
        try {
          await global(ctx, payload)
          return true
        } catch {
          return false
        }
      }
      if (typeof adapter.executeCommand === 'function') {
        try {
          const handled = await adapter.executeCommand(name, ctx, payload)
          return handled === true
        } catch {
          return false
        }
      }
      return false
    }
  }

  return self
}

export { debounce, DEFAULT_AUTOSAVE_DELAY_MS } from './utils/debounce'

export type {
  EditorAdapter,
  EditorCapability,
  EditorChangeHook,
  EditorCommandContext,
  EditorCommandHandler,
  EditorCommandName,
  EditorCreateOptions,
  EditorInstance,
  EditorLifecycleHook,
  EditorProvider,
  EditorProviderFactory,
  EditorProviderId,
  DebounceFunction,
  UploadHandler,
  UploadResponse
} from './types'

ensureDefaultProviders()
