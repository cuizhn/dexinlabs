# Markdown Engine 独立化重构计划

## Context（为什么改）

架构文档（[ARCHITECTURE.md](file:///C:/Users/cui/Documents/www/dexinlabs/standards/Architecture/ARCHITECTURE.md)、[ADR.md](file:///C:/Users/cui/Documents/www/dexinlabs/markdown-engine/ADR.md)、[SPEC.MD](file:///C:/Users/cui/Documents/www/dexinlabs/markdown-engine/SPEC.MD)、[DESIGN.MD](file:///C:/Users/cui/Documents/www/dexinlabs/markdown-engine/DESIGN.MD)）要求 Markdown Engine 是**独立的、与框架无关的基础设施层**，拥有自己的 `src/tests/fixtures/` 目录，公共 API（`createEngine/render/parse/compile/registerPlugin`），Pipeline 架构（Parser→AST→Transformer→Plugin→Renderer），且禁止依赖 Vue/Nuxt/数据库。

**当前问题：**
1. 渲染代码混在 [app/render/](file:///C:/Users/cui/Documents/www/dexinlabs/app/render) 里，纯逻辑与 Vue 组件耦合
2. [app/render/parsers/markdown.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/parsers/markdown.js) 是 passthrough——不真正解析 Markdown→AST，只把全文塞进一个 text 节点
3. [app/render/theme/MarkdownRenderer.vue](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/theme/MarkdownRenderer.vue) **绕过 pipeline**，直接 `import { marked }` 调 `marked.parse()` + `v-html`
4. [app/render/renderers/vueRenderer.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/renderers/vueRenderer.js) 返回 Vue SFC 组件引用（`component: MarkdownRenderer`），违反 DESIGN.md 要求的「输出 JSON VNode 描述」
5. [app/render/pipeline.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/pipeline.ts) 依赖 `@core/registry`（Nuxt IoC），不是独立引擎

**目标：** 把纯逻辑抽到根目录独立 `markdown-engine/`，实现真实 Markdown→AST 解析，pipeline 全程贯通，Vue 组件降级为消费引擎输出的薄适配层。

---

## 用户确认的决策
- **引擎位置**：根目录 `markdown-engine/`（与 app/ 平级，完全独立，未来可抽 npm 包）
- **范围**：结构重构 + 实现真实解析（marked.lexer → MDAST AST，pipeline 贯通，Vue 消费引擎输出）

---

## 目标目录结构

```
markdown-engine/                     ← 根目录，零 Vue/Nuxt 依赖
  ADR.md (已有)
  DESIGN.MD (已有)
  SPEC.MD (已有)
  VERSION.md (新建)
  RFC/ (新建空目录)
  src/
    index.ts                         公共 API: createEngine/render/parse/compile/registerPlugin
    ast/
      types.ts                       MDAST 兼容 AST 类型（从 @core/contracts/Parser.ts 迁移）
    parser/
      markdown.ts                    真实解析: marked.lexer tokens → MDAST AST
      frontmatter.ts                 从 app/render/parsers/frontmatter.js 迁移
      math.ts                        从 app/render/parsers/math.js 迁移
    transformer/
      heading.ts / toc.ts / links.ts / excerpt.ts / readingTime.ts / reference.ts
                                      6 个纯 transformer 迁移 + TS 化
    plugins/
      types.ts                       Plugin 接口 { name, version, transform(ast, ctx) }
      registry.ts                    引擎内部插件注册表（不依赖 @core/registry）
      builtin.ts                     6 个 transformer 注册为内置插件
    renderer/
      htmlRenderer.ts                AST → HTML（v1 内部委托 marked.parse 保证质量，引擎拥有渲染权）
      vnodeRenderer.ts               AST → JSON VNode 描述树 { type, props, is, children }
    pipeline/
      pipeline.ts                    Pipeline（用内部 registry，不引 @core/registry）
  tests/
    fixtures/ (basic.md, math.md, table.md, code.md)
    snapshots/ (basic.ast.json ...)
    parser.test.ts / pipeline.test.ts
```

**保留在 [app/render/](file:///C:/Users/cui/Documents/www/dexinlabs/app/render)（Vue 适配层）：**
```
app/render/
  pipeline.ts                        薄包装：创建引擎实例，委托给 markdown-engine
  register.ts                        把引擎 + Vue 适配器接入 @core/registry
  renderers/vueRenderer.js           适配器：调 engine.render() → 包成 Vue 可用
  theme/MarkdownRenderer.vue         消费引擎 HTML 输出（删除直接 import marked）
  components/RenderedText.vue        消费 VNode 树
  components/RenderedNode.vue        递归渲染 VNode
```

---

## 实施阶段

### Phase 1 · 引擎建壳 + 纯逻辑迁移
1. 创建 `markdown-engine/` 目录树（src/{ast,parser,transformer,plugins,renderer,pipeline}、tests/{fixtures,snapshots}、RFC/、VERSION.md）
2. **`src/ast/types.ts`**：从 [app/core/contracts/Parser.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/contracts/Parser.ts#L1-L48) 迁移 `AstNodeType / AstNode / RootAstNode / ParserOptions`；从 [Transformer.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/contracts/Transformer.ts#L1-L58) 迁移 `TocEntry / HeadingInfo / TransformedRootAstNode` 等；新增 `VNode` 类型 `{ type, props?, is?, children? }`
3. **`src/parser/frontmatter.ts`**：迁移 [frontmatter.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/parsers/frontmatter.js)，TS 化，纯函数
4. **`src/transformer/*.ts`**：6 个 transformer 逐个迁移 + TS 化（heading/toc/links/excerpt/readingTime/reference），保持纯函数
5. **`src/plugins/types.ts` + `registry.ts`**：定义 `Plugin { name: string; version: string; transform(ast, ctx): ast }`，内部 Map 注册表 + `registerPlugin / getPlugins / clearPlugins`

### Phase 2 · 真实 Parser 实现
**`src/parser/markdown.ts`**：用 `marked.lexer(content)` 产出 tokens，转换为 MDAST AST：
- `heading` token → `{ type:'heading', depth, children:[{type:'text', value}] }`
- `paragraph` token → `{ type:'paragraph', children: convertInline(tokens) }`
- `code` token → `{ type:'code', lang, value }`
- `list` token → `{ type:'list', ordered, children: items }`
- `blockquote` → `{ type:'blockquote', children }`
- `hr` → `{ type:'thematicBreak' }`
- `table` → `{ type:'table', children: rows }`
- inline tokens (strong/em/link/codespan/del) → 对应 MDAST 节点
- 返回 `{ type:'root', children, frontmatter, content }`
- 数学语法 `$...$` / `$$...$$` → `{ type:'math', value, display }` 节点（math.ts parser 处理）

### Phase 3 · 渲染器实现
1. **`src/renderer/htmlRenderer.ts`**：`renderToHTML(ast)` → v1 委托 `marked.parse(ast.content)`（保证 GFM/表格/代码块质量），引擎拥有渲染权；预留 AST→HTML walker 接口供 v2 升级
2. **`src/renderer/vnodeRenderer.ts`**：`renderToVNode(ast)` → 递归遍历 AST 产出 JSON VNode 树，如 `{ type:'heading', props:{ id, level }, is:'h2', children:[...] }`；math 节点 → `{ is:'KatexElement', props:{ formula, display } }`

### Phase 4 · 公共 API + Pipeline
1. **`src/pipeline/pipeline.ts`**：从 [app/render/pipeline.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/pipeline.ts) 迁移，**去掉 `@core/registry` 依赖**，改用内部 plugin registry；签名保持 `runRenderPipeline(content, opts) / renderToHTML / renderToVNode`
2. **`src/plugins/builtin.ts`**：把 6 个 transformer 包装成 Plugin 并注册
3. **`src/index.ts`** 公共 API：
   ```ts
   createEngine({ plugins? }): MarkdownEngine  // 返回带内部 registry 的实例
   engine.parse(md): Promise<RootAstNode>
   engine.render(md, { target:'html'|'vnode' }): Promise<string | VNode>
   engine.compile(md): Promise<{ ast, enhancedAST, html, vnode }>
   engine.registerPlugin(plugin): void
   ```

### Phase 5 · Vue 适配层重构
1. **[app/render/pipeline.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/pipeline.ts)** → 薄包装：`import { createEngine } from '@me'`，创建单例引擎，`runRenderPipeline/renderToHTML/renderToVNode` 委托给引擎；保留原导出签名让 `core/engine` 调用点不变
2. **[app/render/renderers/vueRenderer.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/renderers/vueRenderer.js)** → 适配器：调 `engine.render(ast, {target:'vnode'})` 得 JSON VNode 树，包成 `{ __vnodeReady:true, vnodeTree, ast, props }`；不再返回 Vue 组件引用
3. **[app/render/theme/MarkdownRenderer.vue](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/theme/MarkdownRenderer.vue)** → 删除 `import { marked }`，改为接收引擎产出的 HTML（从 `ast._html` 或 prop），`v-html` 渲染引擎输出
4. **[app/render/register.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/register.ts)** → 仍把 VueRenderer 注册进 `@core/registry`（保持 `core/engine` 集成点不变）

### Phase 6 · 配置 + 契约接线
1. **[nuxt.config.ts](file:///C:/Users/cui/Documents/www/dexinlabs/nuxt.config.ts#L57-L65)** alias 块 + vite resolve alias 块：新增 `'@me': path.resolve(rootDir, 'markdown-engine')`
2. **[tsconfig.json](file:///C:/Users/cui/Documents/www/dexinlabs/tsconfig.json)** paths：新增 `"@me": ["markdown-engine"], "@me/*": ["markdown-engine/*"]`
3. **[app/core/contracts/Parser.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/contracts/Parser.ts) + Transformer.ts**：AST 数据类型改为 `export type { AstNode, RootAstNode, ... } from '@me/ast/types'`（单一真源在引擎，app 侧 re-export 保持现有 import 不破）

### Phase 7 · 测试 + fixtures
1. `tests/fixtures/basic.md`（标题/段落/列表/代码）、`math.md`、`table.md`、`code.md`
2. `tests/parser.test.ts`：解析 fixtures → 断言 AST 结构
3. `tests/pipeline.test.ts`：parse → transform → render 全链路
4. `tests/snapshots/*.ast.json`：AST 快照

---

## 关键复用点（不重写）
- **AST 类型**：直接迁移 [Parser.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/contracts/Parser.ts#L1-L48) 已定义的 MDAST 兼容类型，不重新设计
- **6 个 transformer**：[app/render/transformers/](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/transformers) 已是纯函数，只迁移 + TS 化
- **frontmatter 提取**：[frontmatter.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/parsers/frontmatter.js) 逻辑保留
- **pipeline 控制流**：[pipeline.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/render/pipeline.ts) 的错误收集/transformer 顺序/return shape 保留，只换 registry 依赖
- **marked 库**：已安装 v18，用 `marked.lexer` 做 parser、`marked.parse` 做 htmlRenderer 后端

## 集成点不变
- [app/core/engine/index.ts](file:///C:/Users/cui/Documents/www/dexinlabs/app/core/contracts/../engine/index.ts#L93-L107) `EngineRenderFacade.pipe/toHTML/toVNode` 仍调 `@render/pipeline`（签名不变）
- [app/plugins/engine.client.js](file:///C:/Users/cui/Documents/www/dexinlabs/app/plugins/engine.client.js) / engine.server.js 仍调 `bootContentEngine()`，不变

---

## 验证
1. `npx nuxi typecheck` → 0 错误
2. `npm run build` → exit 0（Vercel 产物完整）
3. `npm run sync` → 8/8 幂等
4. `npx tsx markdown-engine/tests/parser.test.ts` → parser 单测通过
5. 手动 `npm run dev` → 访问 lesson 页面 → 确认 Markdown 渲染正常（标题/列表/代码/数学公式）
6. 确认 `markdown-engine/src/` 下无任何 `vue` / `nuxt` / `@core` / `@data` import（grep 验证零框架依赖）

## 风险
- **marked.lexer token 格式**：marked v18 的 token 结构需实测确认，若 inline tokens 嵌套复杂则 parser 实现工作量增加 → fallback：先用 marked.lexer 产出 block 级 AST，inline 暂留 text 节点
- **HTML 渲染质量**：v1 htmlRenderer 委托 marked.parse 保证质量，但严格说不算「AST→HTML」→ 标注为 v1 策略，v2 升级为 AST walker
- **Vue 组件契约变化**：MarkdownRenderer.vue 从「自己调 marked」改为「消费引擎输出」，需确保 prop 传递链不中断
