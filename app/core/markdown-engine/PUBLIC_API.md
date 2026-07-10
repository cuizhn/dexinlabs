# Markdown Engine — Public API Frozen Specification

> **Status**: FROZEN（Phase 8 稳定化阶段 · 2026-07-10 起）
> **Owner**: Dexin Labs Architecture
> **Alias**: `@me` → `app/core/markdown-engine/src`
> **Deprecation Grace Period**: 14 days（任何 API 修改必须走 RFC，双导出并存 14 天后才能删除）
> **Engine Red Line**: 本 Engine 永远零 Vue / 零 Nuxt / 零 Nitro / 零 Drizzle / 零 Content Engine / 零 Course Module 依赖（红线）

---

## 1. Allowed Imports（业务代码只能从 `@me` 或完整路径 `app/core/markdown-engine/src/index.ts` 取如下符号）

**禁止任何业务代码直接 import 内部子路径**（如 `@me/parser/markdown` / `@me/transformer/heading` 等），所有能力必须走 `@me` 单一出口。

### 1.1 Engine 实例（必用 API）

```ts
// 创建/取/替换引擎实例
export function createEngine(config?: EngineConfig): MarkdownEngine
export function getEngine(): MarkdownEngine          // 单例，不存在则自动 create
export function setEngine(engine: MarkdownEngine): void  // 测试替换 / 自定义 engine
```

### 1.2 便捷函数（推荐业务使用，不用自己 create 实例）

```ts
// 直接调用（内部 getEngine() 取单例）
export function parseMarkdown(raw: string, opts?: ParserOptions): Promise<RootAstNode>
export function runRenderPipeline<TRendered>(input: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<RenderPipelineResult<TRendered>>
export function renderToHTML(content: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<string>
export function renderToVNode(content: RenderPipelineInput, opts?: RenderPipelineOptions): Promise<VNode | null>
```

### 1.3 插件管理（低阶 API，仅 Application 编排层可调用）

```ts
export function registerPlugin(plugin: Plugin, order?: number): void
export function unregisterPlugin(name: string): void
export function getPlugins(): PluginDefinition[]
export function clearPlugins(): void
export function registerBuiltinPlugins(enabled?: string[]): string[]
```

### 1.4 Compiler + Adapters（V2 新增，RenderTree 原生渲染模式）

```ts
// Compile：AST → PascalCase RenderNode Tree（Heading/Paragraph/Code/...，可 1:1 映射 Vue/React 组件）
export function compileToRenderTree(astOrInput?: RootAstNode | string): RenderRoot

// 3 RenderTree Adapters（RenderNode Tree → 3 种输出）
export function renderTreeToHTML(root: RenderRoot, ctx?: Partial<RendererAdapterContext>): string
export function renderTreeToVNode(root: RenderRoot, ctx?: Partial<RendererAdapterContext>): VNode | null
export function renderTreeToJSON(root: RenderRoot): string
export function parseJSONToRenderTree(json: string): RenderRoot | null
```

### 1.5 AST Adapter（marked tokens ↔ Internal AST 互转工具）

```ts
export function buildInternalRoot(children?: InternalAstNode[], mode?: 'passthrough' | 'enhanced'): InternalRootAstNode
export function adapterConvertBlockTokens(tokens: ParserOutput): InternalAstNode[]
export function adapterConvertInlineTokens(tokens: ParserOutput): InternalAstNode[]
export function adapterInjectMathNodes(nodes: InternalAstNode[]): InternalAstNode[]
```

### 1.6 类型（业务代码可自由引用，无 Breaking 必保证向后兼容）

```ts
// ===== 对外业务类型 =====
export type { Plugin }
export type {
  AstNode, RootAstNode, TransformedAstNode, TransformedRootAstNode,
  VNode, ParserOptions, TransformerContext, RendererContext,
  TocEntry, HeadingInfo, ReadingTimeInfo
}
export type {
  RenderPipelineInput, RenderPipelineOptions,
  RenderPipelineResult, RenderTarget, EngineConfig, MarkdownEngine, CompileResult
}

// ===== V2 内部类型（谨慎使用，未来可能小改） =====
export type {
  InternalAstNode, InternalRootAstNode, TransformedInternalAstNode,
  TransformedInternalRootAstNode, InternalHeadingNode, InternalCodeNode,
  InternalMathNode, InternalLinkNode, InternalListNode
}
export type { MarkedToken, ParserTokenTree, ParserOutput }
export type {
  RenderNode, RenderRoot, RenderTree, RenderNodeType, RendererAdapterContext
}
```

---

## 2. Forbidden Imports（严格禁止，Code Review 直接打回）

以下 import 方式**一律不允许**在业务代码（components / pages / composables / plugins / modules / server / content scripts 等）出现：

```ts
// ❌ 禁止：直接 import 内部子目录
import { parseMarkdown } from '@me/parser/markdown'
import { slugifyHeading } from '@me/transformer/heading'
import { runPlugins } from '@me/plugins/registry'

// ❌ 禁止：import renderer 内部实现
import { htmlRenderer } from '@me/renderer/htmlRenderer'
import { vnodeRenderer } from '@me/renderer/vnodeRenderer'

// ❌ 禁止：使用完整物理路径（必须用别名 @me，避免路径变更后业务代码集体炸）
import { renderToHTML } from '~/core/markdown-engine/src/index'
import { createEngine } from '../../app/core/markdown-engine/src/index'

// ❌ 禁止：任何将 Vue/Nuxt/Nitro/Drizzle/Content Engine/Course Module 依赖写进 markdown-engine 的 PR
import { defineComponent } from 'vue'              // 不能进 markdown-engine/
import { useNuxtApp } from '#imports'              // 不能进 markdown-engine/
import { drizzle } from 'drizzle-orm'               // 不能进 markdown-engine/
import { lessonService } from '@ce'                 // 不能进 markdown-engine/
```

---

## 3. Version Policy（冻结后版本策略 · 严格遵循 SemVer 2）

Markdown Engine 当前版本：**2.0.0 FROZEN**（见 [VERSION.md](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/markdown-engine/VERSION.md)）

### 3.1 版本号规则

```text
MAJOR.MINOR.PATCH
│     │     │
│     │     └── PATCH：Bug 修复（测试增加 / README 更新 / 注释修改 / 非功能性改动）→ 100% 向后兼容
│     └──────── MINOR：新增能力（新 export / 新 Plugin / 新 Adapter）→ 100% 向后兼容，不删任何符号
└────────────── MAJOR：Breaking Change（删除 API / 修改类型形状 / 改变 Pipeline 顺序）
```

### 3.2 Breaking Change 流程（Phase 8 起强制执行 RFC）

MAJOR 版本 bump 必须走完以下流程，未走完的 PR 一律不合并：

1. **RFC 阶段**：新建 `standards/RFC/RFC-XXX-markdown-engine-vX.md`（XXX 编号，X 为下一代 MAJOR 版本号）
   - 写清「为什么要改」「改哪些 API」「迁移步骤」「14 天双导出兼容期如何度过」「回滚方案」
2. **双导出兼容期（14 天 minimum）**：
   - 旧符号保留 + 标记 `/** @deprecated Use XXX instead */`
   - `console.warn('[MarkdownEngine Deprecated] XXX will be removed in vX.Y. Use YYY.')`（只在开发环境 warn）
3. **Migration Guide**：[MIGRATION.md](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/markdown-engine/MIGRATION.md) 必须更新对应版本章节
4. **Code Search 全量替换**：在项目内全局 grep 旧符号，替换率 ≥ 95% 才能删旧符号

### 3.3 冻结期（Phase 8 稳定化阶段）Policy

Phase 8 期间（2026-07-10 起）**禁止 MINOR 扩展**：

```text
✅ 允许：PATCH 级改动（bug fix / 增加测试 / 注释 / fixtures / 文档修正）
❌ 禁止：MINOR 级扩展（新增 Public API export / 新增 Plugin / 新增 Adapter）
❌ 禁止：MAJOR 级 Breaking（删除 API / 改形状 / 改 Pipeline）
❌ 禁止：任何 Mermaid / MDX / Diagram / AI Plugin / npm publish 动作（见 §5 Deferred RFC List）
```

---

## 4. Current Frozen Public API Snapshot（冻结快照 · v2.0.0）

> 本快照从 [src/index.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/markdown-engine/src/index.ts#L31-L188) 直接提取，任何新增/删除必须走 RFC 后再更新本文件。

### Functions 快照（23 个函数导出）

| # | Function | 模块来源 | Category |
|---|---|---|---|
| 1 | `createEngine(config?)` | index.ts:61 | Engine 实例 |
| 2 | `getEngine()` | index.ts:130 | Engine 实例 |
| 3 | `setEngine(engine)` | index.ts:137 | Engine 实例 |
| 4 | `parseMarkdown(raw, opts?)` | parser/markdown.ts 透传 | 便捷函数 |
| 5 | `runRenderPipeline(input, opts?)` | pipeline/pipeline.ts 透传 | 便捷函数 |
| 6 | `renderToHTML(content, opts?)` | pipeline/pipeline.ts 透传 | 便捷函数 |
| 7 | `renderToVNode(content, opts?)` | pipeline/pipeline.ts 透传 | 便捷函数 |
| 8 | `registerPlugin(plugin, order?)` | plugins/registry.ts 透传 | 插件管理 |
| 9 | `unregisterPlugin(name)` | plugins/registry.ts 透传 | 插件管理 |
| 10 | `getPlugins()` | plugins/registry.ts 透传 | 插件管理 |
| 11 | `clearPlugins()` | plugins/registry.ts 透传 | 插件管理 |
| 12 | `registerBuiltinPlugins(enabled?)` | plugins/builtin.ts 透传 | 插件管理 |
| 13 | `compileToRenderTree(ast?)` | compiler/index.ts 透传 | Compiler V2 |
| 14 | `renderTreeToHTML(root, ctx?)` | adapters/htmlAdapter.ts 透传 | Adapter V2 |
| 15 | `renderTreeToVNode(root, ctx?)` | adapters/vnodeAdapter.ts 透传 | Adapter V2 |
| 16 | `renderTreeToJSON(root)` | adapters/jsonAdapter.ts 透传 | Adapter V2 |
| 17 | `parseJSONToRenderTree(json)` | adapters/jsonAdapter.ts 透传 | Adapter V2 |
| 18 | `buildInternalRoot(children?, mode?)` | adapter/ast-adapter.ts 透传 | AST Adapter |
| 19 | `adapterConvertBlockTokens(tokens)` | adapter/ast-adapter.ts 透传 | AST Adapter |
| 20 | `adapterConvertInlineTokens(tokens)` | adapter/ast-adapter.ts 透传 | AST Adapter |
| 21 | `adapterInjectMathNodes(nodes)` | adapter/ast-adapter.ts 透传 | AST Adapter |
| 22 | `default` export object（10 聚合导出） | index.ts:189 | Legacy 兼容 |
| 23 | `listPlugins()` 方法（MarkdownEngine 实例方法） | index.ts:115 | 实例方法 |

### Types 快照（35+ 类型导出 · 见 1.6 完整清单）

- 对外业务类型：14（Plugin + AstNode 族 + Pipeline 族 + Toc/Heading/ReadingTime + Engine 接口族）
- V2 内部类型：21（InternalAst 12 + ParserToken 3 + RenderTree 6）

---

## 5. Deferred RFC List（Phase 8 暂缓事项 · 等待 RFC 再开工）

Phase 8 稳定化阶段**禁止开工以下扩展**，如需开工必须先创建 RFC 文档走完评审流程：

| 编号 | 功能 | 预估影响范围 | 为什么暂缓 |
|---|---|---|---|
| D-01 | Mermaid Plugin（流程图/时序图/甘特图） | MINOR（1 新 Plugin + 新 Renderer 节点 Mermaid） | 需要先定：RenderTree 新增 Mermaid 节点类型？还是 MathNode 扩展？Plugin order 放哪（100+？50-100 之间？） |
| D-02 | MDX Support（组件嵌入 JSX） | MAJOR 级 Breaking（AST 新增 JSX Expression / Fragment 等一堆节点类型，Pipeline 顺序需新增前置解析阶段） | 与 Vue 3 `<component :is>` 渲染模式冲突，必须先定：MDX 编译发生在 Engine 内还是 Application（@vue/babel-plugin-jsx）层？ |
| D-03 | Diagram Plugin（几何/函数作图，类似 Desmos） | MINOR（新 Plugin + 新 DiagramNode） | 选型未定：Desmos SDK / GeoGebra / Canvas 原生画？性能与 Bundle Size 权衡需先调研 |
| D-04 | AI Plugin（AI 解释公式/AI 生成练习题/AI 翻译） | MAJOR（新增外部 fetch 依赖 / 密钥注入方式 / 流式输出机制） | 依赖全局 Auth / API Key 管理架构（本项目尚未建），等基础设施具备再开工 |
| D-05 | 独立 npm Publish（`@dexinlabs/markdown-engine`） | 纯工程化（不影响 Public API 形状） | 需要先定：独立 package.json / tsconfig / rollup 打包 / CI 发布流程？内部 peerDependencies 范围（marked/katex/js-yaml）？ |

### RFC 模板（开工前必须照抄）

```text
standards/RFC/RFC-XXX-markdown-engine-<功能名>.md
├── Background
├── Requirements
├── Design Options（≥ 2 方案对比）
├── Chosen Design + Reasoning
├── Plugin Order（如适用）
├── Breaking Change Impact（如有）
├── Migration Steps（如有）
└── Rollback Plan
```
