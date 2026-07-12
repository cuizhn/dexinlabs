# RFC002 · Editor Toolbar

| 项目 | 内容 |
|---|---|
| 状态 | **草案 (Draft)** · V1 仅建立规范，**未实现** |
| 范围 | `app/core/editor/` + 业务 `LessonEditor.vue` 组件层 |
| 责任 | 评审反馈 §3 / §4：Toolbar 调用 Command，不调用具体编辑器 API |

---

## 1. 背景与动机

Vditor 默认自带 Toolbar，但它是 Vditor 专属的。如果未来换 Milkdown：
- 业务层 Toolbar UI 需要重写
- Toolbar 按钮绑定的是 `vditor.insertValue()` 这类 Vendor API，无法复用

必须把 Toolbar 视为 **Editor 的上层 UI 组合**，而非 Vendor 内部组件，按钮只触发 `editor.executeCommand(name, payload)`。

---

## 2. 设计要求

### 2.1 Toolbar 的正确分层
```
LessonEditor.vue (业务组件)
    ↓ 组合
EditorToolbar.vue (通用 UI，来自 Vue 组件库 / app/components)
    ↓ 仅调用
editor.executeCommand(name, payload)
    ↓
Editor (统一接口层，不关心 Toolbar UI)
    ↓
Provider → Adapter → Vditor / Milkdown
```

### 2.2 Toolbar Item 描述接口（预定义，V1 仅写 RFC）
```ts
interface ToolbarItem {
  readonly id: string                              // 'insert:formula' | 'bold'
  readonly label: string                           // 中文展示名
  readonly icon?: string                           // 图标名
  readonly requireCapability?: keyof EditorCapability  // 'supportsMath' 等
  readonly command: string                         // executeCommand(name=command)
  readonly commandPayload?: unknown                // payload
  readonly when?: (editor: EditorInstance) => boolean   // 显隐条件
}
```

### 2.3 已注册的 V1 命令（已可用于 Toolbar 按钮）
见 `adapters/vditor.ts#executeCommand` 已实现：
- `insert:definition` / `definition` — payload: `{ content?: string }`
- `insert:theorem` / `theorem` — payload: `{ content?: string }`
- `insert:exercise` / `exercise` — payload: `{ content?: string }`
- `insert:formula` / `formula` — payload: `string` (tex)
- `insert:image` / `image` — payload: `{ url: string; name?: string }`
- `insert:markdown` — payload: `string`

---

## 3. V1 现状

- Toolbar 暂由 Vditor 自带实现（`EditorCreateOptions.toolbar` 透传）
- 业务层要自定义 Toolbar 按钮时，必须走 `editor.executeCommand(name, payload)`
- 禁止：`LessonEditor.vue` 里 `import { Vditor } from 'vditor'` 或通过 getAdapter() 强转后访问 vditor 实例

## 4. 未决事项

1. 是否需要 `registerToolbarItem(item)` / `listToolbarItems()` 全局注册？
2. 与 Markdown Engine 自定义块（definition/theorem/exercise）的图标、快捷键如何映射？

---

文档版本：v1.0 | 创建时间：2026-07-12
