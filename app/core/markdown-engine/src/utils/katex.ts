/**
 * KaTeX Thin Wrapper — 数学公式 → 真实 HTML 渲染工具（Engine 内部使用，不对外 export）
 *
 * 设计原则：
 *   1. throwOnError: false — 任何 KaTeX 错误都 fallback 为原始公式占位，不让整个页面炸掉
 *   2. strict: false — 不严格检查 LaTeX 语法，教学内容可能有些许不规范
 *   3. 错误时返回 span.math 占位，与之前实现保持一致（平滑降级）
 *   4. 不引入 CSS：CSS 由 Application 层（Nuxt nuxt.config.ts css: ['katex/dist/katex.min.css']）负责加载
 *      保持 Engine 零 CSS / 零框架依赖，便于 Node 测试 / SSR 独立运行 / 未来独立发布 npm
 *   5. 静态 import：本项目 package.json 已声明 `"katex": "^0.17.0"`，无需运行时 require
 */
import katex from 'katex'
import type { KatexOptions } from 'katex'

const renderFn: ((expression: string, options?: KatexOptions) => string) | undefined =
  typeof (katex as unknown as { renderToString?: typeof katex.renderToString }).renderToString ===
  'function'
    ? (katex as unknown as { renderToString: typeof katex.renderToString }).renderToString
    : ((katex as unknown as { default?: typeof katex }).default?.renderToString as
        | typeof katex.renderToString
        | undefined)

let lastLoadError: Error | null = null

export function getKatexLoadInfo(): { loaded: boolean; error: Error | null } {
  return { loaded: typeof renderFn === 'function', error: lastLoadError }
}

export function renderFormulaToKatexHtml(
  formula: string,
  displayMode: boolean = false,
): string {
  if (typeof formula !== 'string') return ''
  const tex = formula.trim()
  if (!tex) return ''

  if (typeof renderFn !== 'function') {
    return fallbackPlaceholder(tex, displayMode, 'katex-renderToString-not-available')
  }

  try {
    const options: KatexOptions = {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    }
    const html = renderFn(tex, options)
    if (!html || typeof html !== 'string') {
      return fallbackPlaceholder(tex, displayMode, 'katex-empty-output')
    }
    const wrapperClass = displayMode
      ? 'math math-display katex-display-wrapper'
      : 'math math-inline katex-inline-wrapper'
    return (
      `<span class="${wrapperClass}" data-display="${displayMode ? 'true' : 'false'}" data-katex-rendered="true">` +
      html +
      `</span>`
    )
  } catch (e) {
    const reason = e instanceof Error ? e.message?.slice(0, 80) : 'unknown'
    lastLoadError = e instanceof Error ? e : new Error(String(e))
    return fallbackPlaceholder(tex, displayMode, `katex-error:${reason || 'unknown'}`)
  }
}

function escapeAttr(s: string): string {
  return String(s).replace(/"/g, '&quot;')
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function fallbackPlaceholder(tex: string, displayMode: boolean, reason: string): string {
  const delim = displayMode ? '$$' : '$'
  const cls = displayMode
    ? 'math math-display katex-fallback'
    : 'math math-inline katex-fallback'
  return (
    `<span class="${cls}" data-display="${displayMode ? 'true' : 'false'}" ` +
    `data-katex-fallback="true" data-fallback-reason="${escapeAttr(reason)}">` +
    `${delim}${escapeHtml(tex)}${delim}</span>`
  )
}

export default { renderFormulaToKatexHtml, getKatexLoadInfo }


