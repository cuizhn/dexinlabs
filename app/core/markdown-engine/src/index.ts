/**
 * Markdown Engine — Public API
 * 
 * 设计意图：
 * =========
 * 提供 Markdown 解析和渲染的公共 API，作为整个 Markdown Engine 的统一入口。
 * 
 * 为什么需要统一入口？
 * =================
 * 1. **API 稳定**：提供稳定的公共接口，上层代码不依赖内部实现
 * 2. **零框架依赖**：Engine 不依赖 Vue/Nuxt，可独立发布为 npm 包
 * 3. **插件系统**：支持自定义插件扩展功能
 * 4. **多格式输出**：支持 HTML、VNode 等多种输出格式
 * 
 * 架构原则：
 * =========
 * 1. **单向依赖**：Parser → AST Adapter → Internal AST → Transformer → Compiler → Render Tree → Adapter
 * 2. **零框架依赖**：Engine 内部不引用任何 Vue/Nuxt/Database 代码
 * 3. **插件化**：所有转换逻辑通过插件实现
 * 4. **协议化**：使用 Render Tree 作为跨平台渲染协议
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **统一 Engine 入口** | API 稳定，零框架依赖 | 增加抽象层 |
 * | 直接使用 marked | 简单直接 | 缺乏扩展能力 |
 * | remark/rehype 生态 | 插件丰富 | 学习曲线陡峭，配置复杂 |
 * 
 * 本方案优势：
 * ===========
 * - **零框架依赖**：可独立发布为 npm 包
 * - **API 稳定**：公共接口保持不变，内部可重构
 * - **多格式输出**：支持 HTML、VNode、JSON 三种输出格式
 * - **插件化**：支持内置插件和自定义插件
 * - **类型安全**：完整的 TypeScript 类型支持
 * 
 * 公共 API（Per SPEC.md §4）：
 * =========================
 * - createEngine(): 创建 Engine 实例
 * - getEngine(): 获取默认 Engine 实例
 * - parse(): 解析 Markdown 为 AST
 * - render(): 渲染 Markdown 为 HTML 或 VNode
 * - compile(): 完整编译流程（AST + HTML + VNode）
 * - registerPlugin(): 注册插件
 * - unregisterPlugin(): 注销插件
 * 
 * 使用方式：
 * ========
 * // 获取默认 Engine
 * const engine = getEngine()
 * 
 * // 解析 Markdown
 * const ast = await engine.parse('# Hello')
 * 
 * // 渲染为 HTML
 * const html = await engine.render('# Hello', { target: 'html' })
 * 
 * // 渲染为 VNode
 * const vnode = await engine.render('# Hello', { target: 'vnode' })
 * 
 * // 完整编译
 * const { ast, html, vnode } = await engine.compile('# Hello')
 */
import { parseMarkdown } from './parser/markdown'
import {
  runRenderPipeline,
  renderToHTML,
  renderToVNode,
  type RenderPipelineInput,
  type RenderPipelineOptions,
  type RenderPipelineResult
} from './pipeline/pipeline'
import {
  registerPlugin,
  unregisterPlugin,
  getPlugins,
  clearPlugins
} from './plugins/registry'
import type { Plugin } from './plugins/types'
import { registerBuiltinPlugins } from './plugins/builtin'
import type { RootAstNode, VNode, TransformedRootAstNode } from './ast/types'
import { compileToRenderTree } from './compiler/index'

/**
 * EngineConfig - Engine 配置接口
 * 
 * 设计意图：
 * =========
 * 定义 Engine 的初始化配置选项，支持自定义插件和解析器选项。
 * 
 * 字段说明：
 * =========
 * - plugins: 启用的内置插件名称列表
 * - customPlugins: 自定义插件列表
 * - parserOptions: 解析器选项
 */
export interface EngineConfig {
  plugins?: string[]
  customPlugins?: Plugin[]
  parserOptions?: Record<string, unknown>
}

/**
 * CompileResult - 编译结果接口
 * 
 * 设计意图：
 * =========
 * 定义 compile() 方法的返回类型，包含所有编译产物。
 * 
 * 字段说明：
 * =========
 * - ast: 原始 AST
 * - enhancedAST: 经过插件转换后的 AST
 * - html: 渲染后的 HTML
 * - vnode: 渲染后的 VNode
 * - errors: 编译过程中的错误列表
 */
export interface CompileResult {
  ast: RootAstNode | null
  enhancedAST: TransformedRootAstNode | null
  html: string
  vnode: VNode | null
  errors: Error[]
}

/**
 * MarkdownEngine - Engine 公共接口
 * 
 * 设计意图：
 * =========
 * 定义 Engine 的公共 API 接口，上层代码只依赖此接口。
 * 
 * 方法说明：
 * =========
 * - parse: 解析 Markdown 为 AST
 * - render: 渲染 Markdown 为 HTML 或 VNode
 * - compile: 完整编译流程
 * - registerPlugin: 注册插件
 * - unregisterPlugin: 注销插件
 * - listPlugins: 列出所有已注册的插件
 * - run: 运行渲染管线
 */
export interface MarkdownEngine {
  parse(md: string, opts?: Record<string, unknown>): Promise<RootAstNode>
  render(
    content: RenderPipelineInput,
    opts?: Partial<RenderPipelineOptions> & { target?: 'html' | 'vnode' }
  ): Promise<string | VNode | null>
  compile(md: string, opts?: Partial<RenderPipelineOptions>): Promise<CompileResult>
  registerPlugin(plugin: Plugin, order?: number): void
  unregisterPlugin(name: string): void
  listPlugins(): string[]
  run(
    content: RenderPipelineInput,
    opts?: RenderPipelineOptions
  ): Promise<RenderPipelineResult>
}

/**
 * createEngine - 创建 Engine 实例
 * 
 * 实现逻辑：
 * ========
 * 1. 清空现有插件
 * 2. 注册内置插件
 * 3. 注册自定义插件
 * 4. 返回 Engine 实例，包含所有公共方法
 * 
 * 为什么这样设计？
 * ==============
 * 1. **隔离性**：每次创建新实例都会清空插件，避免交叉影响
 * 2. **灵活性**：支持自定义插件配置
 * 3. **可测试性**：可以创建不同配置的实例进行测试
 * 
 * @param config Engine 配置
 * @returns MarkdownEngine Engine 实例
 */
export function createEngine(config: EngineConfig = {}): MarkdownEngine {
  /** 清空现有插件 */
  clearPlugins()
  
  /** 注册内置插件 */
  registerBuiltinPlugins(config.plugins)
  
  /** 注册自定义插件 */
  if (config.customPlugins) {
    for (const p of config.customPlugins) {
      registerPlugin(p, p.order || 100)
    }
  }

  /** 返回 Engine 实例 */
  return {
    /** 解析 Markdown 为 AST */
    async parse(md: string, opts: Record<string, unknown> = {}): Promise<RootAstNode> {
      return parseMarkdown(md, { ...config.parserOptions, ...opts })
    },

    /** 渲染 Markdown 为 HTML 或 VNode */
    async render(
      content: RenderPipelineInput,
      opts: Partial<RenderPipelineOptions> & { target?: 'html' | 'vnode' } = {}
    ): Promise<string | VNode | null> {
      const target = opts.target || 'html'
      if (target === 'html') {
        return renderToHTML(content, opts as RenderPipelineOptions)
      }
      return renderToVNode(content, opts as RenderPipelineOptions)
    },

    /** 完整编译流程 */
    async compile(
      md: string,
      opts: Partial<RenderPipelineOptions> = {}
    ): Promise<CompileResult> {
      /** 渲染为 HTML */
      const htmlResult = await runRenderPipeline<string>(md, {
        ...opts,
        renderTarget: 'html'
      } as RenderPipelineOptions)
      
      /** 渲染为 VNode */
      const vnodeResult = await runRenderPipeline<VNode>(md, {
        ...opts,
        renderTarget: 'vnode'
      } as RenderPipelineOptions)
      
      /** 合并结果 */
      return {
        ast: htmlResult.ast,
        enhancedAST: htmlResult.enhancedAST,
        html: htmlResult.rendered || '',
        vnode: vnodeResult.rendered || null,
        errors: [...htmlResult.errors, ...vnodeResult.errors]
      }
    },

    /** 注册插件 */
    registerPlugin(plugin: Plugin, order: number = 100): void {
      registerPlugin(plugin, order)
    },

    /** 注销插件 */
    unregisterPlugin(name: string): void {
      unregisterPlugin(name)
    },

    /** 列出所有已注册的插件 */
    listPlugins(): string[] {
      return getPlugins().map(p => p.name)
    },

    /** 运行渲染管线 */
    run(
      content: RenderPipelineInput,
      opts: RenderPipelineOptions
    ): Promise<RenderPipelineResult> {
      return runRenderPipeline(content, opts)
    }
  }
}

/** 默认 Engine 实例（单例） */
let defaultEngine: MarkdownEngine | null = null

/**
 * getEngine - 获取默认 Engine 实例
 * 
 * 实现逻辑：
 * ========
 * 1. 如果默认实例不存在，创建新实例
 * 2. 返回默认实例
 * 
 * 为什么使用单例？
 * ==============
 * 1. **性能**：避免重复创建实例
 * 2. **一致性**：全局共享相同的插件配置
 * 3. **简单性**：使用方无需管理实例生命周期
 * 
 * @returns MarkdownEngine 默认 Engine 实例
 */
export function getEngine(): MarkdownEngine {
  if (!defaultEngine) {
    defaultEngine = createEngine()
  }
  return defaultEngine
}

/**
 * setEngine - 设置默认 Engine 实例
 * 
 * 使用场景：
 * ========
 * - 测试时注入 mock 实例
 * - 自定义 Engine 配置
 * 
 * @param engine Engine 实例
 */
export function setEngine(engine: MarkdownEngine): void {
  defaultEngine = engine
}

/** 导出核心函数 */
export { parseMarkdown, runRenderPipeline, renderToHTML, renderToVNode }

/** 导出插件管理函数 */
export { registerPlugin, unregisterPlugin, getPlugins, clearPlugins }

/** 导出内置插件注册函数 */
export { registerBuiltinPlugins }

/** 导出编译器 */
export { compileToRenderTree } from './compiler/index'

/** 导出适配器 */
export { renderTreeToHTML } from './adapters/htmlAdapter'
export { renderTreeToVNode } from './adapters/vnodeAdapter'
export { renderTreeToJSON, parseJSONToRenderTree } from './adapters/jsonAdapter'
export { adapterConvertBlockTokens, adapterConvertInlineTokens, adapterInjectMathNodes, buildInternalRoot } from './adapter/ast-adapter'

/** 导出类型定义 */
export type { Plugin } from './plugins/types'
export type {
  AstNode,
  RootAstNode,
  TransformedAstNode,
  TransformedRootAstNode,
  VNode,
  ParserOptions,
  TransformerContext,
  RendererContext,
  TocEntry,
  HeadingInfo,
  ReadingTimeInfo
} from './ast/types'
export type {
  InternalAstNode,
  InternalRootAstNode,
  TransformedInternalAstNode,
  TransformedInternalRootAstNode,
  InternalHeadingNode,
  InternalCodeNode,
  InternalMathNode,
  InternalLinkNode,
  InternalListNode
} from './types/internal-ast'
export type { MarkedToken, ParserTokenTree, ParserOutput } from './types/parser-ast'
export type {
  RenderNode,
  RenderRoot,
  RenderTree,
  RenderNodeType,
  RendererAdapterContext
} from './types/render-tree'
export type {
  RenderPipelineInput,
  RenderPipelineOptions,
  RenderPipelineResult,
  RenderTarget
} from './pipeline/pipeline'

/** 默认导出 */
export default { createEngine, getEngine, parseMarkdown, renderToHTML, renderToVNode, compileToRenderTree }
