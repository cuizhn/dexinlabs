import { getSource, getParser, getRenderer, getTransformers } from './registry'

export async function runPipeline(rawOrContent, opts = {}) {
  const result = {
    raw: rawOrContent,
    source: null,
    loaderMeta: {},
    ast: null,
    enhancedAST: null,
    rendered: null,
    errors: []
  }

  const source = opts.source || getSource()
  const parser = opts.parser || getParser()
  const transformers = getTransformers()
  const renderer = opts.renderer || getRenderer()

  try {
    result.source = source ? source.constructor?.name || 'anonymous' : null

    if (parser && typeof rawOrContent === 'string') {
      result.ast = await parser.parse(rawOrContent, opts.parserOptions || {})
    } else {
      result.ast = rawOrContent
    }

    result.enhancedAST = result.ast

    for (const t of transformers) {
      try {
        result.enhancedAST = await t.transform(result.enhancedAST, {
          ...opts,
          pipelineResult: result
        })
      } catch (e) {
        result.errors.push(new Error(`[Pipeline][Transformer] ${e.message}`))
      }
    }

    if (renderer && result.enhancedAST) {
      try {
        if (opts.renderTarget === 'html') {
          result.rendered = await renderer.renderToHTML(result.enhancedAST, opts)
        } else {
          result.rendered = renderer.renderToVNode
            ? await renderer.renderToVNode(result.enhancedAST, opts)
            : await renderer.renderToHTML(result.enhancedAST, opts)
        }
      } catch (e) {
        result.errors.push(new Error(`[Pipeline][Renderer] ${e.message}`))
      }
    }
  } catch (e) {
    result.errors.push(e)
  }

  return result
}

export function createPipeline(overrides = {}) {
  return {
    async run(content, opts = {}) {
      return runPipeline(content, { ...overrides, ...opts })
    }
  }
}
