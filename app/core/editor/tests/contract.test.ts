import {
  createEditor,
  listEditorProviders,
  registerEditorProvider,
  debounce
} from '../src'
import type {
  EditorAdapter,
  EditorCreateOptions,
  EditorInstance,
  EditorCapability,
  EditorCommandContext,
  EditorCommandName
} from '../src/types'
import { createVditorAdapter } from '../src/adapters/vditor'
import { FallbackStorageUploader, toMarkdownImageLinks } from '../../storage-engine/src'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

class MockAdapter implements EditorAdapter {
  md = ''
  _created = false
  _destroyed = false
  _focused = false
  _changeHook: ((md: string) => void) | null = null
  _saveHook: ((md: string) => void) | null = null
  onChangeCalls = 0
  onSaveCalls = 0

  async create(options: EditorCreateOptions): Promise<void> {
    this.md = options.initialMarkdown ?? ''
    this._created = true
    if (options.onChange) this._changeHook = options.onChange
    if (options.onSave) this._saveHook = options.onSave
  }
  async destroy(): Promise<void> { this._destroyed = true; this._created = false }
  async getMarkdown(): Promise<string> { return this.md }
  async setMarkdown(md: string): Promise<void> { this.md = md }
  async insert(text: string, replace?: boolean): Promise<void> {
    if (replace) this.md = text
    else this.md += text
  }
  async focus(): Promise<void> { this._focused = true }
  async blur(): Promise<void> { this._focused = false }
  isCreated(): boolean { return this._created && !this._destroyed }
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
  async executeCommand(
    name: EditorCommandName,
    context: EditorCommandContext,
    payload?: unknown
  ): Promise<boolean> {
    if (name === 'mock:ping') {
      const text = typeof payload === 'string' ? payload : 'pong'
      await context.insert(text, false)
      return true
    }
    return false
  }
  simulateChange(md: string) {
    this.md = md
    this.onChangeCalls++
    if (this._changeHook) this._changeHook(md)
  }
  simulateSave(md: string) {
    this.onSaveCalls++
    if (this._saveHook) void this._saveHook(md)
  }
}

async function main() {
  console.log('=== Editor · Contract / Provider / Command / Capability / Red-Line Tests ===')

  // ---------- Parameter validation ----------
  await test('createEditor with invalid _adapter throws friendly error', async () => {
    let threw = false
    try { createEditor({ _adapter: null as unknown as EditorAdapter }) } catch { threw = true }
    assert(threw, 'createEditor should throw when resolved adapter is null')
  })

  await test('createEditor with unknown provider throws; message lists registered ones', async () => {
    let threw = false
    let msg = ''
    try { createEditor({ provider: '__does_not_exist__' }) } catch (e: unknown) {
      threw = true
      msg = String((e as Error)?.message ?? '')
    }
    assert(threw, 'unknown provider must throw')
    assert(msg.includes('vditor'), `error should mention vditor default; got: ${msg}`)
  })

  // ---------- Public method shape ----------
  await test('EditorInstance exposes required public methods + capability + commands', async () => {
    const editor: EditorInstance = createEditor({ _adapter: new MockAdapter() })
    const expectedMethods = [
      'create', 'destroy', 'getMarkdown', 'setMarkdown', 'insert',
      'focus', 'blur', 'onChange', 'onSave', 'isCreated', 'getAdapter',
      'registerCommand', 'executeCommand'
    ] as const
    for (const key of expectedMethods) {
      assert(typeof (editor as unknown as Record<string, unknown>)[key] === 'function',
        `missing method: ${key}`)
    }
    assert(typeof editor.capability === 'object' && editor.capability !== null,
      'editor.capability must be present as Readonly object')
    assert(Object.isFrozen(editor.capability) === true, 'editor.capability must be frozen')
    assert(editor.capability.vendor === 'mock', 'mock adapter reports mock vendor via capability')
    void debounce
  })

  // ---------- Flow through unified interface ----------
  await test('MockAdapter create/get/set/insert flow through new createEditor({ _adapter }) signature', async () => {
    const editor = createEditor({ _adapter: new MockAdapter() })
    await editor.create({ container: '#test', initialMarkdown: '# Hello' })
    assert(editor.isCreated(), 'isCreated true after create()')
    assert((await editor.getMarkdown()) === '# Hello', 'initialMarkdown passed through')
    await editor.setMarkdown('# Updated')
    assert((await editor.getMarkdown()) === '# Updated', 'setMarkdown works')
    await editor.insert('\n\nParagraph')
    assert((await editor.getMarkdown()) === '# Updated\n\nParagraph', 'insert appends')
    await editor.insert('# Replace', true)
    assert((await editor.getMarkdown()) === '# Replace', 'insert replace=true replaces')
  })

  // ---------- focus/blur/destroy forwarding ----------
  await test('focus/blur forwarded to adapter; destroy flips isCreated', async () => {
    const adapter = new MockAdapter()
    const editor = createEditor({ _adapter: adapter })
    await editor.create({ container: '#t' })
    await editor.focus()
    assert(adapter._focused === true, 'focus forwarded')
    await editor.blur()
    assert(!adapter._focused, 'blur forwarded')
    await editor.destroy()
    assert(editor.isCreated() === false, 'destroy flips isCreated')
  })

  // ---------- Hook wiring ----------
  await test('editor.onChange & editor.onSave hooks receive events via adapter wiring', async () => {
    const adapter = new MockAdapter()
    const editor = createEditor({ _adapter: adapter, autoSave: { enabled: false } })
    let changeReceived = ''
    let saveReceived = ''
    editor.onChange(md => { changeReceived = md })
    editor.onSave(md => { saveReceived = md })
    await editor.create({ container: '#t', initialMarkdown: 'a' })
    adapter.simulateChange('b')
    assert(changeReceived === 'b', `onChange received expected, got: ${changeReceived}`)
    adapter.simulateSave('c')
    assert(saveReceived === 'c', `onSave received expected, got: ${saveReceived}`)
  })

  // ---------- Provider Registry ----------
  await test('listEditorProviders returns default vditor provider id', () => {
    const list = listEditorProviders()
    assert(Array.isArray(list) && list.includes('vditor'),
      `vditor should be registered by default; got: ${list.join(',')}`)
  })

  await test('registerEditorProvider rejects invalid shapes', () => {
    let threwA = false, threwB = false, threwC = false
    try { registerEditorProvider(null as unknown as never) } catch { threwA = true }
    try { registerEditorProvider({ id: '', createAdapter: () => new MockAdapter() }) } catch { threwB = true }
    try { registerEditorProvider({ id: 'x', createAdapter: 'not a function' as unknown as never }) } catch { threwC = true }
    assert(threwA && threwB && threwC, 'invalid provider shapes should throw')
  })

  await test('custom provider: registerEditorProvider → createEditor({ provider: id }) uses it', async () => {
    const custom = new MockAdapter()
    registerEditorProvider({ id: 'test-custom-mock', createAdapter: () => custom })
    assert(listEditorProviders().includes('test-custom-mock'), 'custom id present after register')
    const editor = createEditor({ provider: 'test-custom-mock' })
    await editor.create({ container: '#t2', initialMarkdown: 'custom-md' })
    assert(editor.isCreated() === true, 'custom provider editor isCreated')
    assert((await editor.getMarkdown()) === 'custom-md', 'custom provider adapter receives initialMarkdown')
    assert(editor.getAdapter() === custom, 'editor.getAdapter() returns the adapter from custom provider')
    await editor.destroy()
  })

  // ---------- createEditor({ provider: "vditor" }) business-only API (no adapter name leak in call) ----------
  await test('business-only createEditor({ provider: "vditor" }) works; SSR no-op get/set memory md', async () => {
    const editor = createEditor({ provider: 'vditor' })
    const shape = ['create', 'destroy', 'getMarkdown', 'setMarkdown', 'insert',
      'focus', 'blur', 'onChange', 'onSave', 'isCreated', 'getAdapter',
      'registerCommand', 'executeCommand'] as const
    for (const k of shape) {
      assert(typeof (editor as unknown as Record<string, unknown>)[k] === 'function',
        `provider=vditor editor missing method: ${k}`)
    }
    await editor.create({ container: '#void', initialMarkdown: 'SSR # test' })
    assert(editor.isCreated() === true, 'SSR create() succeeds via provider=vditor (no-op) and isCreated true')
    assert((await editor.getMarkdown()) === 'SSR # test', 'SSR getMarkdown via provider=vditor returns in-memory md')
    await editor.setMarkdown('SSR # updated')
    assert((await editor.getMarkdown()) === 'SSR # updated', 'SSR setMarkdown via provider=vditor works via memory')
    await editor.insert(' +more')
    assert((await editor.getMarkdown()) === 'SSR # updated +more', 'SSR insert appends via provider=vditor')
    assert(editor.capability.vendor === 'vditor', 'provider=vditor reports vendor vditor via capability')
    await editor.destroy()
    assert(editor.isCreated() === false, 'destroy flips isCreated false')
  })

  // ---------- Vditor Adapter shape (SSR no-op) ----------
  await test('createVditorAdapter() returns 10 method + reportCapabilities + executeCommand shape', async () => {
    const adapter = createVditorAdapter()
    const shape = ['create', 'destroy', 'getMarkdown', 'setMarkdown', 'insert',
      'focus', 'blur', 'onChange', 'onSave', 'isCreated', 'reportCapabilities', 'executeCommand'] as const
    for (const k of shape) {
      assert(typeof (adapter as unknown as Record<string, unknown>)[k] === 'function',
        `VditorAdapter missing method: ${k}`)
    }
    const cap = adapter.reportCapabilities()
    assert(cap.supportsMath === true, 'vditor supportsMath=true')
    assert(cap.supportsMermaid === true, 'vditor supportsMermaid=true')
    assert(cap.supportsImageUpload === true, 'vditor supportsImageUpload=true')
    assert(cap.supportsTable === true, 'vditor supportsTable=true')
    assert(cap.supportsHistory === true, 'vditor supportsHistory=true')
    assert(cap.vendor === 'vditor', 'vditor capability.vendor === vditor')
  })

  // ---------- Capability introspection (not instanceof) ----------
  await test('editor.capability read-only — freeze prevents accidental vendor-specific branching mutation', () => {
    const editor = createEditor({ _adapter: new MockAdapter() })
    let threw = false
    try {
      (editor.capability as unknown as { supportsMath: boolean }).supportsMath = true
    } catch { threw = true }
    assert(threw === true || editor.capability.supportsMath === false,
      'capability mutation must throw or be no-op (frozen)')
  })

  // ---------- Command system: global registerCommand + adapter-level executeCommand ----------
  await test('editor.registerCommand registers a global command; executeCommand invokes', async () => {
    const editor = createEditor({ _adapter: new MockAdapter() })
    await editor.create({ container: '#tcmd', initialMarkdown: '' })
    editor.registerCommand('global:append', async (ctx, payload) => {
      const text = typeof payload === 'string' ? payload : 'x'
      await ctx.insert(text, false)
    })
    const ok = await editor.executeCommand('global:append', 'hello')
    assert(ok === true, 'global command returns true')
    assert((await editor.getMarkdown()) === 'hello', 'global command actually mutated markdown')
    await editor.destroy()
  })

  await test('editor.executeCommand falls through to adapter.executeCommand; returns false if unhandled', async () => {
    const editor = createEditor({ _adapter: new MockAdapter() })
    await editor.create({ container: '#tcmd2', initialMarkdown: '' })
    const okMock = await editor.executeCommand('mock:ping', '!')
    assert(okMock === true, 'adapter.executeCommand handled mock:ping')
    assert((await editor.getMarkdown()) === '!', 'adapter command mutated md')
    const unknown = await editor.executeCommand('no-such-cmd:xyz')
    assert(unknown === false, 'unknown command returns false')
    await editor.destroy()
  })

  // ---------- Vditor adapter custom-block commands (definition/theorem/exercise/formula/image/markdown) ----------
  await test('Vditor adapter.executeCommand insert:definition / insert:theorem / insert:formula work', async () => {
    const editor = createEditor({ provider: 'vditor' })
    await editor.create({ container: '#tvdcmd', initialMarkdown: 'hi\n\n' })
    await editor.executeCommand('insert:definition', { content: 'Define X' })
    const md1 = await editor.getMarkdown()
    assert(md1.includes(':::definition'), `insert:definition should render :::definition block; got: ${md1}`)
    assert(md1.includes('Define X'), `insert:definition content rendered`)

    await editor.executeCommand('theorem', { content: 'Thm Y' })
    const md2 = await editor.getMarkdown()
    assert(md2.includes(':::theorem'), `theorem shortcut should render :::theorem block`)

    await editor.executeCommand('formula', 'a^2+b^2=c^2')
    const md3 = await editor.getMarkdown()
    assert(md3.includes('$$'), `insert:formula should render $$ block`)
    assert(md3.includes('a^2+b^2=c^2'), `insert:formula content rendered inside $$`)

    await editor.executeCommand('insert:image', { url: 'https://a.com/z.png', name: 'Z' })
    const md4 = await editor.getMarkdown()
    assert(md4.includes('![Z](https://a.com/z.png)'), `insert:image with name/url renders correct md link`)

    await editor.destroy()
  })

  // ---------- Storage (moved out of Editor module) ----------
  await test('FallbackStorageUploader.upload throws helpful error; import from @storage not @editor', async () => {
    const up = new FallbackStorageUploader()
    let threw = false
    try { await up.upload([] as unknown as File[]) } catch (e: unknown) {
      threw = true
      const msg = String((e as Error)?.message ?? '')
      assert(msg.includes('StorageUploader') || msg.includes('storage-engine'),
        `error must mention StorageUploader / storage-engine; got: ${msg}`)
    }
    assert(threw, 'FallbackStorageUploader.upload must throw')
  })

  await test('toMarkdownImageLinks produces correct ![name](url) format', () => {
    const md = toMarkdownImageLinks([
      { url: 'https://a.com/x.png', name: 'X' },
      { url: 'https://a.com/y.jpg' }
    ])
    assert(md === '![X](https://a.com/x.png)\n![image](https://a.com/y.jpg)', md)
  })

  // ---------- 🔴 RED LINE TESTS: vendor isolation ----------
  const rootDir = join(__dirname, '..')
  const srcIndexContent = readFileSync(join(rootDir, 'src', 'index.ts'), 'utf-8')
  const srcTypesContent = readFileSync(join(rootDir, 'src', 'types.ts'), 'utf-8')
  const debounceContent = readFileSync(join(rootDir, 'src', 'utils', 'debounce.ts'), 'utf-8')

  await test('🔴 RED LINE: @editor Public API (src/index.ts exports) ZERO vditor name leak', async () => {
    const exportRe = /^\s*export\s+(?:\{[^}]*createVditor[^}]*\}|default|type|function|const|let|var)\s*(?:createVditor|vditor)/im
    assert(!exportRe.test(srcIndexContent),
      '@editor Public API must NOT export createVditorAdapter / any vditor-named symbols')

    const dynamicRe1 = /^\s*export\s*\{[^}]*\bcreateVditorAdapter\b[^}]*\}/m
    assert(!dynamicRe1.test(srcIndexContent), 'src/index.ts must not re-export createVditorAdapter')

    const lines = srcIndexContent.split(/\r?\n/).filter(l => l.startsWith('export '))
    for (const l of lines) {
      assert(!/\b(vditor|Vditor)\b/.test(l),
        `@editor export line must not mention Vditor/vditor vendor name; got line: ${l.trim()}`)
    }
  })

  await test('🔴 RED LINE: src/types.ts has ZERO vditor import / Vditor-specific type reference', () => {
    const hasVditorImport = /\bfrom\s+['"]vditor['"]|import\s*\(\s*['"]vditor['"]\s*\)/g.test(srcTypesContent)
    assert(!hasVditorImport, 'types.ts must NOT import vditor module (static or dynamic)')

    const hasVditorSpecificTypes = /\b(VditorOptions|VditorEvent|VditorInstance|IVditorOptions)\b/g.test(srcTypesContent)
    assert(!hasVditorSpecificTypes,
      'types.ts must NOT reference VditorOptions/VditorEvent/VditorInstance etc — only generic Editor* types allowed')
  })

  await test('🔴 RED LINE: src/index.ts & src/utils/debounce.ts ZERO vditor import; export statements zero vendor name', () => {
    const importVditorRe = /(?:^\s*import\s+.*\s+from\s+['"]vditor['"]|import\s*\(\s*['"]vditor['"]\s*\))/m
    assert(!importVditorRe.test(srcIndexContent), 'index.ts must NOT import vditor package (static or dynamic)')
    assert(!importVditorRe.test(debounceContent), 'debounce.ts must NOT import vditor package')

    const exportLines = srcIndexContent.split(/\r?\n/).filter(l => l.startsWith('export '))
    for (const l of exportLines) {
      assert(!/\b(vditor|Vditor)\b/.test(l),
        `@editor export line must not mention Vditor/vditor vendor name; got line: ${l.trim()}`)
    }
  })

  await test('🔴 RED LINE: only src/adapters/vditor.ts is allowed to import "vditor"', () => {
    const vditorAdapter = readFileSync(join(rootDir, 'src', 'adapters', 'vditor.ts'), 'utf-8')
    const importVditorRe = /(?:^\s*import\s+.*\s+from\s+['"]vditor['"]|import\s*\(\s*['"]vditor['"]\s*\))/m
    assert(importVditorRe.test(vditorAdapter),
      'adapters/vditor.ts MUST contain either static or dynamic import of vditor module')
    const otherSources = [srcIndexContent, srcTypesContent, debounceContent].join('\n')
    assert(!importVditorRe.test(otherSources),
      'non-adapter sources must NOT import vditor package (static or dynamic)')
  })

  // ---------- Business layer never sees adapter name ----------
  await test('Business pattern: createEditor() defaults to provider=vditor; call site has zero Vditor reference', async () => {
    const editor = createEditor()
    assert(typeof editor.create === 'function', 'default createEditor() returns EditorInstance')
    await editor.create({ container: '#biz-pattern', initialMarkdown: '# Biz' })
    assert((await editor.getMarkdown()) === '# Biz', 'default provider works; no Vditor named at call site')
    assert(editor.capability.vendor === 'vditor', 'default vendor is vditor')
    await editor.destroy()
  })

  console.log('')
}

main().catch(e => { console.error(e); process.exit(1) })
