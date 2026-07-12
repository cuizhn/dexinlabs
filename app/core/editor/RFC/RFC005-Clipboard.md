# RFC005 · Editor Clipboard

| 项目 | 内容 |
|---|---|
| 状态 | **草案 (Draft)** · V1 **未实现**，仅定义抽象 |
| 范围 | `app/core/editor/src/types.ts` EditorAdapter 扩展 + `index.ts` Registry |
| 责任 | 评审反馈 §4 / §10：为未来粘贴图片→自动上传、粘贴自定义块→规范化语法做前置抽象 |

---

## 1. 背景与动机

用户在编辑器内粘贴时常见需求：

| 场景 | 当前 Vditor 行为 | 期望统一行为 |
|---|---|---|
| 粘贴图片 | Vditor 内置 upload → 存 Vditor 内部格式 | 走 Storage Engine → 插入 `![](url)` Markdown |
| 粘贴 Word/HTML | 转 HTML 保存 | 转纯 Markdown 再插入 |
| 粘贴 `:::definition` 块 | 原样（可能丢失换行） | 规范化 Markdown 格式（前后空行） |
| 粘贴跨 Provider 的内容（如从 Milkdown 复制到 Vditor） | 各自行为不一 | 中间交换格式统一为 Markdown 字符串 |

---

## 2. 建议抽象（V1+ 冻结接口前）

```ts
// types.ts 补充：
type PasteSource = 'text/plain' | 'text/html' | 'image' | 'text/markdown'

interface ClipboardEventLike {
  readonly type: 'paste' | 'cut' | 'copy'
  readonly text?: string
  readonly html?: string
  readonly files?: File[]
  preventDefault(): void
}

interface EditorPasteMiddleware {
  readonly name: string
  /** 返回 true 表示该 middleware 已处理，停止后续 middleware；返回 false 走下一个 */
  handle(event: ClipboardEventLike, ctx: EditorCommandContext): boolean | Promise<boolean>
}

interface EditorAdapter {
  // ... existing
  registerPasteMiddleware?(mw: EditorPasteMiddleware): void
  unregisterPasteMiddleware?(name: string): void
}
```

## 3. V1 现状 + 临时红线

- V1：Vditor 内部 `upload.handler` 已统一接入 UploadHandler 注入（见 `EditorCreateOptions.upload`），保证图片上传走 Storage Engine 抽象。
- 🔴 业务层禁止通过 `getAdapter()` 直接监听 `window.paste` 或 Vditor `after` 钩子。若需要中间件，先在 RFC005 扩展。

## 4. 未决事项

1. 是否需要独立的 `registerClipboardMiddleware` 全局 Registry（类似 Command），而不是挂在 Adapter 上？
2. Markdown 与 HTML 之间的双向转换由谁负责？（Markdown Engine？）

---

文档版本：v1.0 | 创建时间：2026-07-12
