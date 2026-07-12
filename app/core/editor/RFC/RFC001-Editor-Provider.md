# RFC001 · Editor Provider

| 项目 | 内容 |
|---|---|
| 状态 | **草案 (Draft)** · V1 仅建立规范，未全部实现 |
| 范围 | `app/core/editor/` + 未来新增 `adapters/*` |
| 责任 | 评审反馈 §3 / §6：业务层永不见 Adapter/Vditor，仅通过 provider id 创建编辑器 |

---

## 1. 背景与动机

V1 初版 ADR 调用写法：
```ts
createEditor(createVditorAdapter(), { autoSave: {...} })
```
业务层直接 import `createVditorAdapter`，Vendor 名泄露到调用处，未来换 Milkdown 时调用处仍需改一行。

评审反馈要求：
> 业务层永远不知道 Vditor / Milkdown / TipTap，只知道 `createEditor({ provider: 'vditor' })`，或干脆 `createEditor()` 走默认。

---

## 2. 设计要求

### 2.1 Provider 接口（已实现于 `types.ts` EditorProvider / EditorProviderFactory）
```ts
interface EditorProvider {
  readonly id: string                           // 'vditor' | 'milkdown' | 'tiptap'
  createAdapter(): EditorAdapter                // 工厂
}
```

### 2.2 Registry（已实现于 `index.ts`）
```ts
registerEditorProvider(provider: EditorProvider): void
listEditorProviders(): string[]
createEditor({ provider?: string, ... }): EditorInstance
```

### 2.3 调用模式（业务层）
```ts
// ① 最简：默认 provider = vditor（由 Registry 保证）
const editor = createEditor()

// ② 显式指定（但仍无 Vendor 名：只是一个字符串 id）
const editor = createEditor({ provider: 'vditor' })

// ❌ 禁止：业务层 import createVditorAdapter
```

---

## 3. V1 落地验收（已通过）

见 `contract.test.ts`：
- `listEditorProviders()` 必须包含 `'vditor'` 默认
- `createEditor({ provider: 'vditor' })` 工作正常
- `createEditor()` 空参数工作正常（默认 provider）
- 自定义 provider id 注册后可通过 `{ provider: id }` 创建
- `registerEditorProvider` 对非法参数抛错
- 🔴 红线：`@editor` Public API 导出语句中不得出现 `vditor` / `Vditor` / `createVditorAdapter` 字样

---

## 4. 未来 V2+ 扩展要点（预留给 Milkdown 迁移）

```ts
// V2：新增 milkdown 后，只需在组合根加 1 行：
registerEditorProvider({ id: 'milkdown', createAdapter: () => createMilkdownAdapter() })

// 业务代码 0 改动（只要 provider id 默认或改成 milkdown）
createEditor({ provider: 'milkdown' })
```

## 5. 未决事项 (Open Questions)

1. Provider 是否需要 `priority` 字段来决定 createEditor() 空参的默认值？当前取最后注册的或固定 `vditor`。
2. 是否需要异步 Provider（`createAdapter(): Promise<EditorAdapter>`）以支持按需加载编辑器包？

---

文档版本：v1.0 | 创建时间：2026-07-12
