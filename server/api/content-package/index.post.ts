/**
 * POST /api/content-package
 *
 * Content Package 发布接口 — 主仓库侧接收入口。
 *
 * Body (application/json, raw):
 *   dexinlabs-content 仓库 compiler 输出的 content-package.json 原文（严格 5 顶层字段）
 *
 * Headers:
 *   x-publish-token: <secret>     — 必须等于服务端 PUBLISH_TOKEN 环境变量
 *
 * 返回 (application/json):
 *   200 { published_at, protocol_version, ast_version, manifest, lessons_affected, exercises_skipped }
 *   400 { error: 'Bad Request',          message: string, details?: string[] }
 *   401 { error: 'Unauthorized',         message: string }
 *   500 { error: 'Internal Server Error',message: string }
 *
 * Publish 过程为 DB 事务：整个 Package 要么全落库要么全部回滚。
 * 调用方（scripts/publish-content.mjs 或 CI）应等待 200 再视为发布成功。
 */
import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import publisher from '@content/service/publish'

export default defineEventHandler(async event => {
  // ① 鉴权：x-publish-token === PUBLISH_TOKEN（严格，MVP 单机共享密钥）
  const expectedToken = process.env.PUBLISH_TOKEN
  if (!expectedToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error',
      message: '服务端未设置 PUBLISH_TOKEN 环境变量，请在 .env 中添加 PUBLISH_TOKEN=<secret>'
    })
  }
  const providedToken = getHeader(event, 'x-publish-token')
  if (!providedToken || providedToken !== expectedToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '缺少或无效的 x-publish-token header。请与服务端 PUBLISH_TOKEN 环境变量核对。'
    })
  }

  // ② 读取 Body 并解析 JSON（readBody 自动解析 application/json）
  let body: any
  try {
    body = await readBody(event)
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `无法解析 JSON Body：${e.message}`
    })
  }
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Body 必须是 Content Package JSON 对象'
    })
  }

  // ③ 交给 Publish Service（包含静态校验 + 全链路事务 UPSERT）
  try {
    const result = await publisher.publish(body)
    return {
      ok: true as const,
      ...result
    }
  } catch (e: any) {
    const msg = e?.message ?? String(e)

    // 校验类错误（validatePackage）→ 400
    if (typeof msg === 'string' && msg.startsWith('Content Package 校验失败')) {
      const lines = msg.split('\n').slice(1).map(line => line.replace(/^\s*\d+\.\s*/, ''))
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Content Package 校验失败',
        data: { details: lines }
      })
    }

    // 其它（DB 错误等）→ 500，日志在 server 侧 stderr，client 不暴露细节
    // eslint-disable-next-line no-console
    console.error('[publish] 发布失败：', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '发布过程中发生服务端错误，请查看服务端日志。'
    })
  }
})
