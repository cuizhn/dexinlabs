export type EditorProviderId = string

export type EditorLifecycleHook = (md: string) => void | Promise<void>

export type EditorChangeHook = (md: string) => void

export interface UploadResponse {
  url: string
  name?: string
  [key: string]: unknown
}

export type UploadHandler = (file: File[]) => Promise<UploadResponse[]>

export interface EditorCreateOptions {
  container: string | HTMLElement
  initialMarkdown?: string
  onChange?: EditorChangeHook
  onSave?: EditorLifecycleHook
  upload?: UploadHandler
  placeholder?: string
  theme?: 'classic' | 'dark'
  height?: string
  cache?: { enable: boolean; id?: string }
  toolbar?: boolean | string[]
  mode?: 'ir' | 'sv' | 'wysiwyg'
  preview?: {
    delay?: number
    maxWidth?: number
    mode?: 'both' | 'editor' | 'preview'
    hljs?: { enable?: boolean; lineNumber?: boolean; style?: string }
    math?: { enable?: boolean; engine?: 'KaTeX' | 'MathJax' }
    mermaid?: { enable?: boolean }
  }
  extraAdapters?: Record<string, unknown>
  [key: string]: unknown
}

export interface EditorCommandContext {
  getMarkdown(): Promise<string>
  setMarkdown(md: string): Promise<void>
  insert(text: string, replace?: boolean): Promise<void>
  adapter: EditorAdapter
}

export type EditorCommandHandler = (
  context: EditorCommandContext,
  payload?: unknown
) => void | Promise<void>

export type EditorCommandName = string

export interface EditorCapability {
  readonly supportsMath: boolean
  readonly supportsMermaid: boolean
  readonly supportsImageUpload: boolean
  readonly supportsTable: boolean
  readonly supportsSlashCommand: boolean
  readonly supportsHistory: boolean
  readonly supportsRichTextShortcuts: boolean
  readonly vendor: 'vditor' | 'milkdown' | 'tiptap' | 'mock' | 'unknown'
  readonly vendorVersion?: string
  readonly [capability: string]: boolean | string | undefined
}

export interface EditorAdapter {
  create(options: EditorCreateOptions): Promise<void>
  destroy(): Promise<void>
  getMarkdown(): Promise<string>
  setMarkdown(md: string): Promise<void>
  insert(text: string, replace?: boolean): Promise<void>
  focus(): Promise<void>
  blur(): Promise<void>
  onChange?(hook: EditorChangeHook): void
  onSave?(hook: EditorLifecycleHook): void
  isCreated(): boolean
  reportCapabilities(): EditorCapability
  executeCommand?(
    name: EditorCommandName,
    context: EditorCommandContext,
    payload?: unknown
  ): boolean | Promise<boolean>
}

export interface EditorProvider {
  readonly id: EditorProviderId
  createAdapter(): EditorAdapter
}

export type EditorProviderFactory = () => EditorProvider

export interface EditorInstance {
  create(options: EditorCreateOptions): Promise<void>
  destroy(): Promise<void>
  getMarkdown(): Promise<string>
  setMarkdown(md: string): Promise<void>
  insert(text: string, replace?: boolean): Promise<void>
  focus(): Promise<void>
  blur(): Promise<void>
  onChange(hook: EditorChangeHook): void
  onSave(hook: EditorLifecycleHook): void
  isCreated(): boolean
  getAdapter(): EditorAdapter
  readonly capability: Readonly<EditorCapability>
  registerCommand(name: EditorCommandName, handler: EditorCommandHandler): void
  executeCommand(name: EditorCommandName, payload?: unknown): Promise<boolean>
}

export type DebounceFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void
  cancel(): void
  flush(): void
}
