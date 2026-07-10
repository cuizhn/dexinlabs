# Markdown Engine 重构 — Phase 7 修复与验证计划

## Summary

ADR0709 v3 markdown-engine 独立化重构的 Phase 1-6 已完成（引擎建壳、真实解析器、渲染器、公共 API、Vue 适配层、配置接线）。Phase 7 验证时 `npm run build` 失败（exit 1），根因是 2 处 TypeScript 语法泄漏进 JS/Vue 文件。探索还发现 3 个功能缺陷（marked v18 API 不兼容 + heading/TOC 文本提取错误），需一并修复后才能通过测试验证。

## Current State Analysis

### 已完成（无需改动）
- `markdown-engine/src/` 目录结构完整：ast/parser/transformer/plugins/renderer/pipeline
- 真实解析器 `parser/markdown.ts` — marked.lexer → MDAST AST，覆盖 heading/paragraph/code/list/table/blockquote/inline tokens
- 插件系统 `plugins/types.ts` + `registry.ts` + `builtin.ts` — 6 个内置插件，order 排序
- VNode 渲染器 `renderer/vnodeRenderer.ts` — AST → JSON VNode 描述树
- AST 类型 `ast/types.ts` — MDAST 兼容 + 教育扩展，单一真源
- `@me` 别名已在 nuxt.config.ts + tsconfig.json 正确配置（→ `markdown-engine/src`）
- App 契约 `Parser.ts`/`Transformer.ts`/`Renderer.ts` 已 re-export `@me/ast/types`
- App 适配层 `render/pipeline.ts`/`register.ts` 已委托引擎
- 零框架依赖：grep 确认 `markdown-engine/src/` 无 vue/nuxt/@core/@data/@render import
- 无残留导入：grep 确认 app/ 下无对已删除的 parsers/transformers 的引用
- 测试 fixtures（basic/math/table/code.md）内容与测试断言匹配

### 需修复的问题（5 个）

#### 问题 1（Build Blocker）：TS 语法泄漏进 Vue SFC
- **文件**：`app/render/theme/MarkdownRenderer.vue:61`
- **现象**：`(result.rendered as string) || ''` 在 `<script setup>`（无 `lang="ts"`）中
- **原因**：Vue SFC 编译器拒绝非 TS script 块中的 `as string` 类型断言
- **构建错误**：`SyntaxError: Unexpected token, expected "," (46:42)`

#### 问题 2（Build Blocker）：TS 语法泄漏进 JS 文件
- **文件**：`app/render/renderers/vueRenderer.js:28`
- **现象**：`(result.rendered as string) || ''` 在 `.js` 文件中
- **原因**：`as string` 是 TypeScript 语法，在纯 JS 中无效

#### 问题 3（Functional Bug）：marked v18 Renderer API 不兼容
- **文件**：`markdown-engine/src/renderer/htmlRenderer.ts`
- **现象**：`renderer.heading = function (text: string, level: number)` 使用旧签名
- **marked v18 实际签名**：`heading({ tokens, depth }: Tokens.Heading): RendererOutput`（见 `node_modules/marked/lib/marked.d.ts:180`）
- **影响**：heading 渲染产出错误 HTML（`text` 实际是 token 对象，`level` 是 undefined）
- **附带问题**：lines 14-19 的 `htmlRenderer` 实例是死代码（创建后从未传给 `marked.parse`）；`buildHeadingIdMap` 依赖的 `ast.headings` 因问题 4 而无效

#### 问题 4（Functional Bug）：heading transformer 无法提取标题文本
- **文件**：`markdown-engine/src/transformer/heading.ts:24`
- **现象**：`slugifyHeading(String(node.value || node.content || ...))` 
- **原因**：heading 节点结构是 `{ type:'heading', depth, children:[...] }`，没有 `value` 或 `content` 字段
- **影响**：所有 heading ID 退化为 `h-0`、`h-1` 等无意义 fallback ID

#### 问题 5（Functional Bug）：toc transformer 无法提取标题文本
- **文件**：`markdown-engine/src/transformer/toc.ts:16`
- **现象**：`String(node.value || node.content || '')`
- **原因**：同问题 4 — heading 节点无 `value`/`content` 字段
- **影响**：TOC 条目的 `text` 字段全部为空字符串

## Proposed Changes

### Fix 1：移除 MarkdownRenderer.vue 中的 TS 类型断言
- **文件**：`app/render/theme/MarkdownRenderer.vue`
- **改法**：line 61 `(result.rendered as string) || ''` → `result.rendered || ''`
- **理由**：`renderedHtml` 是 `ref('')`（string），`result.rendered` 在 `renderTarget:'html'` 时是 string，直接赋值即可，无需类型断言

### Fix 2：移除 vueRenderer.js 中的 TS 类型断言
- **文件**：`app/render/renderers/vueRenderer.js`
- **改法**：line 28 `(result.rendered as string) || ''` → `result.rendered || ''`
- **理由**：同 Fix 1，JS 文件不允许 TS 语法

### Fix 3：修复 htmlRenderer.ts 适配 marked v18 API
- **文件**：`markdown-engine/src/renderer/htmlRenderer.ts`
- **改法**：
  1. 删除死代码：lines 14-19 的 `htmlRenderer` 实例 + `originalHeading`
  2. 删除 `buildHeadingIdMap` 函数（不再需要 — slugify 直接计算，与 heading transformer 一致）
  3. 在模块顶层用 `marked.use()` 注册 v18 格式的 heading renderer：
     ```ts
     import { slugifyHeading } from '../transformer/heading'
     
     marked.use({
       renderer: {
         heading(this: any, { tokens, depth }: { tokens: any[]; depth: number }): string {
           const text = this.parser.parseInline(tokens)
           const plainText = String(text).replace(/<[^>]+>/g, '')
           const id = slugifyHeading(plainText)
           return `<h${depth} id="${id}">${text}</h${depth}>\n`
         }
       }
     })
     ```
  4. `renderToHTML` 简化为 `return marked.parse(content) as string`
- **理由**：marked v18 的 Renderer 方法接收 token 对象而非散列参数；`this.parser.parseInline(tokens)` 是 v18 获取内联 HTML 的标准方式；`marked.use()` 是 v18 注册自定义 renderer 的推荐 API

### Fix 4：新建 transformer 共享工具 + 修复 heading transformer
- **新文件**：`markdown-engine/src/transformer/utils.ts`
  ```ts
  import type { AstNode } from '../ast/types'
  
  export function extractTextFromNode(node: AstNode | null | undefined): string {
    if (!node) return ''
    if (typeof node.value === 'string') return node.value
    if (Array.isArray(node.children)) {
      return node.children.map(child => extractTextFromNode(child)).join('')
    }
    return ''
  }
  ```
- **文件**：`markdown-engine/src/transformer/heading.ts`
  - **改法**：line 24 `slugifyHeading(String(node.value || node.content || ...))` → `slugifyHeading(extractTextFromNode(node as AstNode)) || \`h-${idCounter++}\``
  - import `extractTextFromNode` from `./utils`
- **理由**：heading 节点的文本在 `children` 中的 text/inlineCode 节点里，需递归提取

### Fix 5：修复 toc transformer 文本提取
- **文件**：`markdown-engine/src/transformer/toc.ts`
- **改法**：line 16 `String(node.value || node.content || '')` → `extractTextFromNode(node as AstNode)`
- import `extractTextFromNode` from `./utils`
- **理由**：同 Fix 4

## Assumptions & Decisions

1. **`marked.use()` 全局修改可接受**：引擎是单例，`markdown.ts` 和 `htmlRenderer.ts` 都在模块顶层调用 `marked.setOptions()` / `marked.use()`，两者不冲突（setOptions 设选项，use 设 renderer 方法）
2. **heading ID 一致性**：htmlRenderer 和 heading transformer 都使用 `slugifyHeading()` 函数，确保 HTML 输出的 heading ID 与 AST 中的 ID 一致
3. **`this: any` 类型绕过**：marked v18 的 renderer 方法中 `this.parser` 在类型定义中不直接暴露，用 `this: any` 绕过 TS 检查（与项目 `noImplicitAny: false` 一致）
4. **不改动已验证 OK 的文件**：parser/markdown.ts、plugins/*、vnodeRenderer.ts、ast/types.ts、links.ts、excerpt.ts、readingTime.ts、reference.ts、frontmatter.ts 均无需改动

## Verification Steps

按顺序执行：

1. **修复 5 个问题**（Fix 1-5）
2. **`npm run build`** → exit 0（Vercel 产物完整）
3. **`npx tsx markdown-engine/tests/parser.test.ts`** → 7/7 测试通过
4. **`npx tsx markdown-engine/tests/pipeline.test.ts`** → 8/8 测试通过
5. **`npm run sync`** → 幂等同步（8/8 或当前课程数）
6. **Grep 验证**：`markdown-engine/src/` 下零 `vue`/`nuxt`/`@core`/`@data` import
7. **手动验证**（如条件允许）：`npm run dev` → 访问 lesson 页面 → 确认 Markdown 渲染正常（标题 ID/列表/代码/数学公式）

## 风险

- **marked.use() renderer 合并行为**：v18 的 `marked.use()` 会深度合并 renderer 方法。如果 `markdown.ts` 的 `marked.setOptions()` 与 `htmlRenderer.ts` 的 `marked.use()` 有交互问题，可能需要改用 `new Marked()` 实例隔离。Fallback：移除 heading renderer 覆盖，v1 只用 `marked.parse(content)` 不注入 heading ID（heading ID 仅在 AST/VNode 路径可用）
- **`this.parser` 运行时可用性**：marked v18 的 `marked.use({ renderer: { heading(this, token) {...} } })` 中 `this` 是否绑定 parser 需实测。Fallback：同上
