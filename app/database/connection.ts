/**
 * 数据库连接管理
 *
 * 基于 Neon serverless 驱动，采用懒加载单例模式管理连接池。
 * 适用于 Serverless/Edge 环境，避免冷启动时创建多余连接。
 */
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, type PoolConfig } from '@neondatabase/serverless'
import * as schema from './schema'

type Schema = typeof schema
export type DbInstance = ReturnType<typeof drizzle<Schema>>

let _poolInstance: Pool | null = null
let _dbInstance: DbInstance | null = null

/**
 * 确保数据库连接已初始化（懒加载单例）
 *
 * 连接断开后的重连由 Neon 驱动内部处理，此处仅负责首次创建。
 * 如需强制重建连接，请先调用 closeDb()。
 */
function ensureDbInitialized(): DbInstance {
  if (!_dbInstance) {
    const connectionString: string | undefined = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('[database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.')
    }
    const poolConfig: PoolConfig = {
      connectionString,
      max: 10,                      // Serverless 环境下限制最大连接数
      idleTimeoutMillis: 30_000,    // 空闲连接 30 秒后回收
      connectionTimeoutMillis: 10_000 // 获取连接超时 10 秒
    }
    _poolInstance = new Pool(poolConfig)
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
