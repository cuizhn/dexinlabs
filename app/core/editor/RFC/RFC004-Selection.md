# RFC004 · Editor Selection

| 项目 | 内容 |
|---|---|
| 状态 | **草案 (Draft)** · V1 **未实现**，仅定义抽象 |
| 范围 | `app/core/editor/src/types.ts` EditorAdapter / EditorInstance 扩展 |
| 责任 | 评审反馈 §4 / §5：未来 Toolbar "包裹选区为粗体/引用" 等能力的前置抽象 |

---

## 1. 背景与动机

Vditor / Milkdown / TipTap 都有 Selection 概念但 API 完全不同：
- Vditor：`getSelection()` → `{ startPos, endPos }` (字符位置)
- Milkdown：ProseMirror Selection → `{ from, to }` (文档节点位置)
- TipTap：`state.selection`

没有统一 Selection 抽象，未来替换编辑器时所有 "基于选区操作" 的 Toolbar 按钮必须重写。

---

## 2. 最小抽象（建议 V1+ 实现前冻结接口）

```ts
// 建议新增到 types.ts
interface EditorSelection {
  readonly start: number           // 字符偏移（Markdown 字符串维度），无选区时 start===end
  readonly end: number
  readonly selectedText: string
}

// EditorAdapter 扩展：
interface EditorAdapter {
  // ... existing
  getSelection?(): Promise<EditorSelection | null>
  setSelection?(start: number, end?: number): Promise<void>
  /** 用给定 text 包裹选区，如 wrapSelection('**', '**') → 粗体 */
  wrapSelection?(before: string, after: string): Promise<boolean>
}

// EditorInstance 镜像：
interface EditorInstance {
  // ... existing
  getSelection(): Promise<EditorSelection | null>
  setSelection(start: number, end?: number): Promise<void>
  wrapSelection(before: string, after: string): Promise<boolean>
}
```

---

## 3. 与 Command 协同

```ts
// 未来可实现：粗体命令
editor.registerCommand('format:bold', async ctx => {
  const sel = await (ctx.adapter as EditorAdapter & { getSelection?: () => Promise<EditorSelection | null> }).getSelection?.() ?? null
  if (sel && sel.selectedText.length > 0) {
    const wrapSel = (ctx.adapter as EditorAdapter & { wrapSelection?: (a: string, b: string) => Promise<boolean> }).wrapSelection
    if (wrapSel) return wrapSel('**', '**')
  }
  await ctx.insert('****', false)   // 无选区时插入占位符，让用户去填
  return true
})
```

## 4. V1 约束（未实现前必须遵守）

1. 任何业务代码 **不得直接** 通过 `getAdapter()` 访问 `vditor.editor.element.selectionStart` / `window.getSelection()` 等原生或 Vendor 专有 API。
2. 若必须使用选区，先在 RFC004 提 PR 扩展 Selection 统一接口。

---

## 5. 未决事项

1. Selection 的 "字符偏移" 是否跨 Provider 一致（Vditor 字符串 = Markdown，Milkdown 可能不是字符串语义）？
2. 对富文本 WYSIWYG 模式（如 TipTap）选区坐标与 Markdown 字符串如何双向映射？

---

文档版本：v1.0 | 创建时间：2026-07-12
