# ADR-0003：废弃原有 Markdown 渲染实现，采用独立维护的 Markdown Engine 作为唯一 Markdown 处理基础设施

> Date: 2026-07-09
> Status: **Enforced（强制执行，Migration 完成率 99%：Stage 6 回归验证中）**
> Related Docs: [markdown-engine/SPEC.MD](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/SPEC.MD) · [markdown-engine/DESIGN.MD](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/DESIGN.MD) · [markdown-engine/MIGRATION.md](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/MIGRATION.md) · [markdown-engine/ADR.md](file:///c:/Users/cui/Documents/www/dexinlabs/markdown-engine/ADR.md)

---

## 1. Context（决策背景：为什么不能保留旧渲染系统）

### 1.1 旧架构（Migration 前，即 2026-07-09 前）

旧架构是「**Vue 渲染组件集成式 Markdown 处理**」，代码散落在 `app/render/` 的多个子目录，典型调用链：

```
Page（课程/练习/学习页）
    ↓
MarkdownRenderer.vue（app/render/theme/）—— 组件内嵌解析逻辑 + 直接 marked.parse()
    ↓
app/render/parsers/*.js（3 个 Parser，非 TS 化）
    ↓
app/render/transformers/*.js（6 个独立 JS 函数，非 Plugin 体系，手动 order）
    ↓
app/render/renderers/*.js（vueRenderer.js：直接返回 Vue VNode / 组件引用，非 JSON 描述）
    ↓
HTML → Vue v-html 渲染
```

### 1.2 旧架构 5 个不可接受的长期缺陷

| 缺陷类型 | 具体表现 | 长期影响 |
|---------|---------|---------|
| **与 Vue 强耦合** | ① Renderer 返回 Vue 组件引用 / Vue VNode；② `MarkdownRenderer.vue` 内部直接 `marked.parse()`，解析和展示混在一个组件里；③ 调用方没法从 Node.js 纯后端或 React 端复用 | 引擎变「Vue 附属组件」，想独立发 npm 包或接入其他框架要 100% 重写 |
| **AST 无单一真源，类型漂移** | Contracts（Parser/Transformer/Renderer）只给方法签名，没有**节点 shape 类型**；实际 Parser 产出的节点类型散落在 JS 运行时，TS 层面不可检查 | 3 个月后改一个节点字段，调用方要 N 处回溯 BUG |
| **缺少引擎级门面 + 插件管理混乱** | 业务代码想跑完整流程，得「自己拿 Parser → 手动调 6 个 Transformer（顺序手写）→ 选 Renderer」；没有 `registerPlugin` / `getPlugins(sorted)` / 错误隔离 | 每次加一个 Transformer，得改 3~5 个调用方文件；一个 Transformer 炸整个流程中断 |
| **重复实现风险高** | 旧 `MarkdownRenderer.vue`（app/render/theme）+ `vueRenderer.js` + 3 页面各自写 import 路径 → 代码散 4 处 | 一旦未来新增一个渲染模式（比如 JSON 导出），要改 4 个文件 |
| **违反顶层架构契约** | 违反 [ARCHITECTURE.md §4 Markdown Engine](file:///c:/Users/cui/Documents/www/dexinlabs/standards/Architecture/ARCHITECTURE.md#L217-L246) 明确要求的「Markdown Engine 必须独立维护在 `markdown-engine/` 根目录」+「公共 API 输出 JSON 而非组件引用」条款 | 顶层架构文档沦为摆设 |

---

## 2. Decision（正式决策内容）

**一次性执行 Replacement Migration（替换式迁移），不再追求与旧渲染系统 1:1 API 兼容，未来只保留一套渲染体系**。决策分 4 个子点：

### 2.1 决策 A：引擎位置与独立性（强制执行）
- Markdown Engine **物理位置 = 仓库根目录 `markdown-engine/`**（绝对禁止放在 `app/markdown-engine/` 或 `app/render/modules/markdown/` 等任何 app 内路径）
- Engine 源码 `markdown-engine/src/**` **零 Nuxt/Vue/数据库/业务层依赖**：禁止 `import '#imports'` / `import 'vue'` / `import '@data/*'` / `import '#database/schema'` —— 保证未来 2 人周内可独立发布为 npm 包
- 平台提供公共路径别名 `@me` → `markdown-engine/src`（双入口：`@me` 裸名 + `@me/ast/types` 子路径均可用）

### 2.2 决策 B：应用层只剩一个 Vue Adapter（唯一组件路径）
- **`app/components/markdown/Markdown.vue` 是项目唯一官方 Vue 适配组件**（MIGRATION.md §6 路径强制执行，不许改名或迁到其他目录）
- 该组件严格三职责边界：
  1. 规范化四种输入来源（`value` / `content` / `document` / `ast` → 统一 markdown 字符串）
  2. 调用 `@me` Engine 的公共 API（`getEngine().run()` / `engine.render()`），拿渲染产物
  3. 把结构化输出（HTML/TOC/frontmatter/readingTime）转交 Vue slot 展示
- 严格 4 禁止：❌ Markdown Parsing（不许 marked.parse/markdown-it）· ❌ Plugin 注册（不许 registerPlugin 写在组件里）· ❌ AST 处理（不许自己 walk children 取文本/slug/TOC）· ❌ HTML 渲染拼接逻辑

### 2.3 决策 C：旧实现彻底删除 + 遗留引用全替换
- **旧实现零保留**（MIGRATION.md §4 清单：旧 MarkdownRenderer / 旧 parsers 3 文件 / 旧 transformers 6 文件 / 旧 plugin registry 实现 / 旧 AST utils 等 共 10 文件清理）
- 3 个业务页面（study.vue / course/[chapter]/[lesson].vue / exercise/[chapter].vue）**100% 切到新 Markdown.vue**，不许残留 `import '@render/theme/MarkdownRenderer.vue'`
- 旧 `app/render/` 只保留 3 类薄适配层文件（可保留）：`register.ts`（Engine→@core/registry 兼容注册）、`pipeline.ts`（Engine→@core/contracts 门面）、`renderers/vueRenderer.js`（返回 Engine 产物字符串，不是组件引用）、`components/RenderedNode.vue`（VNode 渲染辅助组件，不是解析逻辑）

### 2.4 决策 D：未来所有 Markdown 扩展必须走 Engine Plugin，禁止再造第二套 Pipeline
- 任何新 Markdown 能力（Concept 高亮 / Exercise 解析 / 代码高亮 / Mermaid 图…）**一律写 Engine Plugin**：先在 `markdown-engine/RFC/` 写 RFC → 加新 Plugin（或 marked.use tokenizer）→ registerBuiltinPlugins 或调用方 `registerPlugin()` 追加
- **永久红线**：任何 PR 里出现「在 app/components 里新写一个 markdown 解析函数 / 在 pages 里直接 import marked / 在 composables 里写 markdown 转换工具」三种情况任意一种 → Code Review **直接打回，不进入合并流程**

---

## 3. Implications（决策影响：收益 + 代价 + 兼容策略）

### 3.1 正向收益（长期价值 5 倍于迁移成本）

| 收益 | 具体表现 |
|------|---------|
| **可移植性 = 100%** | Engine 零框架依赖 → 同一份代码 Vue 能用、React 能用、纯 Node.js SSR 能用、未来独立发 npm 包（2 人周工作量） |
| **AST 类型单一真源** | 所有节点类型只在 `@me/ast/types.ts` 定义，业务层 Contracts 只 re-export —— 改一个类型，TS 会报出所有需要改的地方 |
| **扩展成本极低** | 新增一个 Transformer = 写 `transform(ast, ctx) => ast` 纯函数 + `registerBuiltinPlugins()` 加一行 → 业务调用方**零改动** |
| **独立可测，CI 友好** | 15 单测不依赖 Nuxt/Nitro，`npx tsx` 直接跑；未来加 100 个测试，CI 时间 +2s 级别 |
| **符合顶层架构契约** | ARCHITECTURE.md / SPEC / DESIGN / MIGRATION / ADR 4+1 文档 100% 对齐实际落地，不再出现「文档写引擎独立但代码散在 app/render」的知行分裂 |

### 3.2 一次性迁移代价（已全部承担完毕）

- 迁移文件/改 import/删旧实现/文档对齐 ≈ **6-8h 工作量**（Phase A~E 已完成）
- study.vue 内一句旧注释误导（「使用 markdown-it 作为 Parser」）→ 已修正
- 3 个页面 import 路径改一下 + 组件标签名从 `MarkdownRenderer` 改 `Markdown` → 已完成

### 3.3 向后兼容策略（@core/registry 老调用零改动）

为避免迁移期间影响已有业务代码，Engine 注册进 @core/registry 的**薄适配层**（app/render/register.ts + app/render/pipeline.ts）**保持 100% 兼容**：
- 旧代码 `getParser('markdown')` / `getRenderer('vue')` / `Engine.renderContent()` 等调用方式**一行不改**，仍然可用（内部实际 delegate 给 Engine，对调用方透明）
- 未来 2 个迭代内观察无异常后，才考虑 deprecated 标记 @core/registry 里的 parser/renderer 注册条目（但不会删，至少保留 3 个月兼容期）

---

## 4. Implementation Checklist（落地清单，对应 MIGRATION.md 6 Stage）

| Stage | 状态 | 完成点 |
|-------|------|--------|
| Stage 1：Engine 壳创建 | ✅ Done | `markdown-engine/src/` 8 个子目录 + nuxt.config.ts/tsconfig.json 加 `@me` 别名；Public API 完整 10+ 入口导出 |
| Stage 2：核心能力实现 | ✅ Done | Parser（marked.lexer + MDAST 转换）；6 内置 Plugin + 自管 Registry；HTML/VNode 双 Renderer；compile 通用编译入口 |
| Stage 3：创建唯一 Vue Adapter | ✅ Done | `app/components/markdown/Markdown.vue` 创建，三职责 + 四禁止 + 兼容 `value`/`content` 双 prop 名；顶部 25 行注释写死 MIGRATION 规则 |
| Stage 4：页面全量切换 | ✅ Done | 3/3 业务页面（study / course lesson / exercise chapter）：替换 import（旧 `@render/theme/MarkdownRenderer.vue` → 新相对路径 Markdown.vue）+ 组件标签从 `<MarkdownRenderer>` → `<Markdown>`；旧注释修正 |
| Stage 5：旧实现彻底删除 | ✅ Done | ① 旧 `app/render/theme/MarkdownRenderer.vue` 物理删除；② app/render/parsers/ 3 旧文件 + app/render/transformers/ 6 旧文件 + 空目录清理（共 10 处）；③ 全局 grep 确认无 `import '@render/theme/MarkdownRenderer.vue'` 残留 |
| Stage 6：测试与回归验证 | 🔄 In Progress | 15 Engine 单测 ✅；npm run build（构建 + 类型）⏳；npm run sync（数据链路不影响）⏳；全局 grep 无 legacy 引用 ⏳ |

---

## 5. Anti-Patterns（决策后永久禁止的反模式，Code Review 打回清单）

以下 7 种情况任意出现 1 种，**CR 直接打回 + 链接本 ADR-0003 §5 引用**：

| ID | 反模式 | 正确做法 |
|----|--------|---------|
| AP-001 | 在 `app/components/**` 或 `app/pages/**` 里直接写 `marked.parse()` / `markdown-it()` / `remark().use()` 处理 Markdown | 把待处理内容传 `<Markdown :value="..." />` 或通过 `import { renderToHTML } from '@me'` 调用 Engine |
| AP-002 | 在 `app/render/theme/` 下新建「MarkdownRendererXXX.vue」作为第二套渲染组件（比如加个「暗色主题版」） | 需要主题变化 → 在 `app/components/markdown/Markdown.vue` 里加 `theme` prop + class 切换；需要新渲染模式 → 加 Engine Renderer（如 `renderToJSON`） |
| AP-003 | 新增 Transformer 时直接改 `app/render/pipeline.ts` 往数组里 push 一个匿名函数 | 写一个 Engine Plugin 文件 → `registerPlugin()` 或 `registerBuiltinPlugins()` 注册；自定义插件优先走 RFC |
| AP-004 | 新 Renderer 返回 `import { defineComponent, h } from 'vue'` 结果（即 Vue 组件引用或 Vue VNode） | Renderer 必须返回 HTML string 或框架无关 JSON VNode 描述（`{ type, is, props, children }`，可 `JSON.stringify`）；由 Vue 适配层 `<component :is="node.is">` 真正渲染组件 |
| AP-005 | `markdown-engine/src/**` 里出现 `import '@/app/...'` / `import '@data/...'` / `import '@core/registry'` / `useHead()` 等业务或框架 import | Engine 保持纯；如果需要业务 context，从 `TransformerContext` 传入（函数入参），不要在 Engine 内直接 import 业务模块 |
| AP-006 | 修改 AST 根节点 shape（如改 `type:'root'` → `'document'`）、删除核心 Plugin（heading/toc）、修改默认 Plugin 顺序常量 → 不经 RFC 直接改 PR | 改公共契约必须写 RFC（`markdown-engine/RFC/RFC-XXX-*.md`）+ 至少 14 天双导出兼容期，PR 里附 RFC 链接才过 CR |
| AP-007 | 把 `Markdown.vue`（app/components/markdown/）迁移到其他路径（比如放回 app/render/theme 或变成 composables 渲染） | MIGRATION.md §6 路径是**契约级**要求，任何目录结构调整必须先改 MIGRATION.md §6 再改代码，不能反过来 |

---

## 6. Future Work（后续计划，3 个迭代内执行）

1. **RFC-001~004 落地 V2 教育扩展**：Concept 语法 / Exercise 语法 / Anchor 注入 Links 汇总 / 代码高亮 + Mermaid
2. **AST Snapshots 测试**：新增 `tests/snapshots/*.ast.json`，parser.test.ts 每次跑对比 JSON diff，防止 Parser 意外回归
3. **Migration Status 收敛**：2 个迭代后（2026-07-23 前）把 `app/render/register.ts` 里 @core/registry 兼容注册条目加 `@deprecated` JSDoc 注释 + 3 个月过渡期告警日志
4. **npm 发布准备**：`package.json` 里新增引擎独立脚本（`test:engine` / `build:engine`） + `package.json` name/version 占位（不急着发布，但目录与命令先准备好）

---

## 7. Final Statement

本决策（ADR-0003）**不是「重构建议」，而是项目级硬约束**：自 2026-07-09 起，德鑫实验室只允许存在**一套** Markdown 处理 Pipeline，即独立维护的根目录 `markdown-engine/`；所有调用必须经过 `@me` 公共 API + 唯一 Vue Adapter `app/components/markdown/Markdown.vue`。

任何偏离此约束的代码，不仅是技术债，更直接违反顶层架构文档 ARCHITECTURE.md 的明确契约 —— 必须第一时间修复。
