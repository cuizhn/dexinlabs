import { createError } from 'h3'

export function assertDatabaseReady(): void {
  if (!process.env.DATABASE_URL) {
    throw createError({
      statusCode: 503,
      message: '数据库服务不可用',
      data: { message: 'DATABASE_URL 未配置' }
    })
  }
}

export function assertParam<T>(value: T | undefined, name: string): asserts value is T {
  if (value === undefined) {
    throw createError({
      statusCode: 400,
      message: `缺少必要参数：${name}`,
      data: { message: `请求缺少必要参数 "${name}"` }
    })
  }
}