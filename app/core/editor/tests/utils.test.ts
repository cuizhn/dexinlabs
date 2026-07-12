import { debounce, DEFAULT_AUTOSAVE_DELAY_MS } from '../src/utils/debounce'
import { createEditor } from '../src'
import type {
  EditorAdapter,
  EditorCreateOptions,
  EditorCapability
} from '../src/types'

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
  } catch (e) {
    console.error(`  ✗ ${name}`)
    console.error(`    ${e instanceof Error ? e.message : String(e)}`)
    process.exitCode = 1
  }
}
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

class CountingAdapter implements EditorAdapter {
  md = ''
  created = false
  hook: ((md: string) => void) | null = null
  async create(opts: EditorCreateOptions): Promise<void> {
    this.created = true
    this.md = opts.initialMarkdown ?? ''
    if (opts.onChange) this.hook = opts.onChange
  }
  async destroy(): Promise<void> { this.created = false }
  async getMarkdown(): Promise<string> { return this.md }
  async setMarkdown(md: string): Promise<void> { this.md = md }
  async insert(t: string, r?: boolean): Promise<void> { this.md = r ? t : this.md + t }
  async focus(): Promise<void> { void 0 }
  async blur(): Promise<void> { void 0 }
  isCreated(): boolean { return this.created }
  reportCapabilities(): EditorCapability {
    return Object.freeze({
      supportsMath: false,
      supportsMermaid: false,
      supportsImageUpload: false,
      supportsTable: false,
      supportsSlashCommand: false,
      supportsHistory: false,
      supportsRichTextShortcuts: false,
      vendor: 'mock'
    })
  }
  pushChange(md: string) { this.md = md; if (this.hook) this.hook(md) }
}

async function main() {
  console.log('=== Editor · Utils (debounce / autosave) Tests ===')

  await test('DEFAULT_AUTOSAVE_DELAY_MS equals 3000ms', () => {
    assert(DEFAULT_AUTOSAVE_DELAY_MS === 3000, `expected 3000, got ${DEFAULT_AUTOSAVE_DELAY_MS}`)
  })

  await test('debounce delays calls within window; flush fires immediately', async () => {
    let count = 0 as number
    const fn = () => { count++ }
    const d = debounce(fn as unknown as (...args: unknown[]) => unknown, 40) as unknown as { (): void; cancel(): void; flush(): void }
    d()
    d()
    d()
    assert((count as number) == 0, 'before window: 0 calls')
    d.flush()
    assert((count as number) == 1, 'after flush: 1 call (merged)')
  })

  await test('debounce.cancel discards pending calls', async () => {
    let count = 0 as number
    const d = debounce((() => { count++ }) as unknown as (...args: unknown[]) => unknown, 30) as unknown as { (): void; cancel(): void; flush(): void }
    d()
    d.cancel()
    await sleep(70)
    assert((count as number) == 0, 'cancelled debounce never fires')
  })

  await test('debounce waits for the waitMs window to expire before firing', async () => {
    let lastArg = '' as string
    const d = debounce(((s: string) => { lastArg = s }) as unknown as (...args: unknown[]) => unknown, 25) as unknown as { (s: string): void; cancel(): void; flush(): void }
    d('a')
    d('b')
    await sleep(10)
    assert((lastArg as string) == '', 'after 10ms, still waiting')
    d('c')
    await sleep(70)
    assert((lastArg as string) == 'c', `eventual arg should be 'c', got '${lastArg}'`)
  })

  await test('createEditor autoSave debounces onChange → onSave within 3s window', async () => {
    const adapter = new CountingAdapter()
    let saved = '' as string
    let saveCount = 0 as number
    const editor = createEditor({ _adapter: adapter, autoSave: { enabled: true, delay: 30 } })
    editor.onSave(md => { saved = md; saveCount++ })
    await editor.create({ container: '#t', initialMarkdown: 'v0' })
    adapter.pushChange('v1')
    adapter.pushChange('v2')
    adapter.pushChange('v3')
    assert((saveCount as number) == 0 && (saved as string) === '', 'no save before debounce window')
    await sleep(140)
    assert((saveCount as number) >= 1, `at least 1 save after window, got ${saveCount}`)
    assert((saved as string) == 'v3', `last save payload should be v3, got ${saved}`)
    await editor.destroy()
  })

  await test('createEditor autoSave.enabled=false disables debounced saves entirely', async () => {
    const adapter = new CountingAdapter()
    let saveCount = 0 as number
    const editor = createEditor({ _adapter: adapter, autoSave: { enabled: false } })
    editor.onSave(() => { saveCount++ })
    await editor.create({ container: '#t' })
    adapter.pushChange('a')
    adapter.pushChange('b')
    await sleep(100)
    assert((saveCount as number) == 0, `autoSave disabled, expected 0 saves, got ${saveCount}`)
    await editor.destroy()
  })

  console.log('')
}

main().catch(e => { console.error(e); process.exit(1) })
