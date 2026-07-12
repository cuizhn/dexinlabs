# RFC003 · Editor Command

| 项目 | 内容 |
|---|---|
| 状态 | **草案 (Draft) + 部分已实现** |
| 范围 | `app/core/editor/src/types.ts` `index.ts` `adapters/vditor.ts` |
| 责任 | 评审反馈 §4：预留 Command 扩展点，Toolbar 调用 Command 而非 Vendor API |

---

## 1. 已实现（V1 已落地，可用于生产）

### 1.1 全局命令注册（index.ts）
```ts
editor.registerCommand(name: string, handler: (ctx, payload?) => void | Promise<void>): void
editor.executeCommand(name: string, payload?: unknown): Promise<boolean>
```

### 1.2 Adapter 级命令兜底（vditor.ts 已实现以下命令）
| 命令名 | 别名 | Payload | 效果 |
|---|---|---|---|
| `insert:definition` | `definition` | `{ content?: string }` | 插入 `:::definition\n\n...\n\n:::` 块 |
| `insert:theorem` | `theorem` | `{ content?: string }` | 插入 `:::theorem` 块 |
| `insert:exercise` | `exercise` | `{ content?: string }` | 插入 `:::exercise` 块 |
| `insert:formula` | `formula` | `string` (tex) 或 `{ content?: string }` | 插入 `$$\n...\n$$` |
| `insert:image` | `image` | `{ url: string; name?: string }` | 插入 `![name](url)` |
| `insert:markdown` | — | `string` | 直接插入任意 Markdown |

### 1.3 Command 路由优先级（已实装）
```
executeCommand(name, payload)
    ↓
① global commandRegistry (registerCommand 注册)
    ↓ 命中？执行 → 返回 true / false（执行失败）
    ↓ 未命中
② adapter.executeCommand(name, ctx, payload)
    ↓ 命中并返回 true → 返回 true
    ↓ 返回 false / 方法不存在
③ 返回 false（调用方负责提示"命令不支持"）
```

### 1.4 CommandContext（已实现）
```ts
interface EditorCommandContext {
  getMarkdown(): Promise<string>
  setMarkdown(md: string): Promise<void>
  insert(text: string, replace?: boolean): Promise<void>
  adapter: EditorAdapter   // 仅用于命令高级用法，严禁业务层转为 Vendor 类型
}
```

---

## 2. V1 红线（必须遵守）

1. 🔴 业务层永远 **只** 通过 `editor.executeCommand(name)` 触发操作，不得通过 `editor.getAdapter()` 强转成 Vditor 实例。
2. 🔴 CommandHandler 内 **不得** import Vditor / Milkdown 专有类型；仅使用 CommandContext + 公开 Editor* 类型。
3. 🔴 自定义块语法（definition / theorem / exercise）**只能**由 Command 以 **纯字符串** 方式插入，禁止依赖 Vditor Preview 识别。

---

## 3. 未决事项

1. 是否需要 `unregisterCommand(name)`？
2. 是否需要 `listCommands(): string[]` 给 Toolbar 自动查询可用命令？
3. Command 结果：当前只返回 `boolean`，是否需要标准化 `{ ok: boolean; reason?: string }`？

---

文档版本：v1.0 | 创建时间：2026-07-12
