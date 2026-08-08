/**
 * 数据库连接管理
 *
 * 统一使用 node-postgres (pg) 驱动，通过 DATABASE_URL 适配不同环境：
 * - 本地开发：postgresql://localhost:5432/dexinlabs（TCP 明文）
 * - Neon 生产：postgresql://...neon.tech/neondb?sslmode=require（TLS）
 *
 * 连接池参数按运行环境自动调整：
 * - Vercel Serverless：max=1（函数实例隔离，避免连接数爆炸）
 * - 本地/长运行进程：max=10（常规并发）
 *
 * Repository / Service / API 层通过 getDb() 获取实例，
 * 无需关心底层是本地 PostgreSQL 还是 Neon。
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

type Schema = typeof schema
export type DbInstance = ReturnType<typeof drizzle<Schema>>

let _poolInstance: Pool | null = null
let _dbInstance: DbInstance | null = null

/** 是否运行在 Serverless 环境（Vercel Functions） */
const isServerless = !!process.env.VERCEL

/**
 * 确保数据库连接已初始化（懒加载单例）
 *
 * 如需强制重建连接，请先调用 closeDb()。
 */
function ensureDbInitialized(): DbInstance {
  if (!_dbInstance) {
    const connectionString: string | undefined = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('[database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.')
    }
    _poolInstance = new Pool({
      connectionString,
      /** Serverless 每个函数实例独立，限制单连接；长运行进程可并发 10 连接 */
      max: isServerless ? 1 : 10,
      /** Serverless 空闲 5 秒即回收，避免冻结期间持有无效连接 */
      idleTimeoutMillis: isServerless ? 5_000 : 30_000,
      connectionTimeoutMillis: 10_000
    })
    _dbInstance = drizzle(_poolInstance, { schema })
  }
  return _dbInstance
}

export function getDb(): DbInstance {
  return ensureDbInitialized()
}

export async function closeDb(): Promise<void> {
  if (_poolInstance) {
    try {
      await _poolInstance.end()
    } catch {
      // 关闭连接池时忽略清理错误，避免影响正常退出流程
    } finally {
      _poolInstance = null
      _dbInstance = null
    }
  }
}

export { schema }
export default { getDb, closeDb, schema }
