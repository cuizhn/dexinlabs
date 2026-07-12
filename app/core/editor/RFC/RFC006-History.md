# RFC006 · Editor History (Undo / Redo)

| 项目 | 内容 |
|---|---|
| 状态 | **草案 (Draft)** · V1 **部分已声明**（Capability 已含 supportsHistory） |
| 范围 | `app/core/editor/src/types.ts` EditorCapability + EditorInstance 扩展 |
| 责任 | 评审反馈 §5：Capability 统一描述能力，禁止 `instanceof Vditor` 判断支持与否 |

---

## 1. 背景与动机

撤销/重做几乎是所有编辑器通用能力，但：
- 有些编辑器（纯 textarea 模式）需要自己实现 History Stack
- Vditor / Milkdown / TipTap 内置 History Stack

必须通过统一的接口暴露 + Capability 声明，业务层不允许判断 `if (editor.getAdapter() instanceof VditorAdapter)`。

---

## 2. V1 已落地部分

```ts
// types.ts EditorCapability:
readonly supportsHistory: boolean
```

Vditor Adapter 报告：
```ts
supportsHistory: true   // 已在 buildVditorCapability 中声明
```

业务层使用模式（已合法）：
```ts
if (editor.capability.supportsHistory) {
  // 在 Toolbar 显示 undo / redo 按钮
} else {
  // 禁用或隐藏
}
```

---

## 3. 建议统一 History API（V1 未实现，冻结接口前）

```ts
// types.ts 补充：
interface EditorHistorySnapshot {
  readonly version: number
  readonly markdown: string
  readonly timestamp: number
}

interface EditorAdapter {
  // ... existing
  undo?(): Promise<boolean>
  redo?(): Promise<boolean>
  canUndo?(): Promise<boolean>
  canRedo?(): Promise<boolean>
  historyCount?(): Promise<{ undo: number; redo: number }>
  pushHistorySnapshot?(): Promise<void>      // 手动打入快照（执行复杂命令前后）
  onHistoryChange?(handler: (snapshot: EditorHistorySnapshot) => void): void
}

interface EditorInstance {
  // ... existing
  undo(): Promise<boolean>
  redo(): Promise<boolean>
  canUndo(): Promise<boolean>
  canRedo(): Promise<boolean>
  historyCount(): Promise<{ undo: number; redo: number }>
}
```

## 4. 与 autoSave / Command 的协同

```
onChange → debounce 3s → onSave (写 DB)
                ↓
        undo/redo 栈由 Adapter 内置维护，
        不与 autoSave 互相干扰；
        Command 执行完毕后应当调用
        adapter.pushHistorySnapshot()（若支持）
```

## 5. 红线

1. 🔴 若 Adapter supportsHistory=false，业务层 **必须** 隐藏 Undo/Redo 按钮，不得访问 Vendor 原生 History。
2. 🔴 禁止直接监听 `Ctrl+Z` / `Ctrl+Y` 键盘事件覆盖 Provider 默认行为（除非通过 RFC005 ClipboardMiddleware 显式接管）。

## 6. 未决事项

1. 是否允许 Provider 使用外部 History Stack（如基于 Markdown diff 的自己实现，覆盖内置）？
2. 跨页面刷新恢复：History Stack 是否需要持久化到 localStorage？与 EditorCreateOptions.cache 关系？

---

文档版本：v1.0 | 创建时间：2026-07-12
