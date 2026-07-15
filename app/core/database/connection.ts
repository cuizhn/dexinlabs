/**
 * connection.ts - 数据库连接管理
 * 
 * 设计意图：
 * =========
 * 管理 PostgreSQL 数据库连接池，提供延迟初始化和单例模式。
 * 
 * 为什么使用 Neon Serverless？
 * ========================
 * 1. **Serverless 兼容**：支持 Vercel、Netlify 等 Serverless 平台
 * 2. **连接池优化**：自动管理连接生命周期，适合无状态环境
 * 3. **性能**：基于 pg 库，性能优秀
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **Neon Serverless** | Serverless 兼容，连接池优化 | 仅支持 PostgreSQL |
 * | pg 原生连接 | 功能全面 | 需要手动管理连接池 |
 * | Prisma Client | ORM 集成 | 额外依赖，类型不够灵活 |
 * 
 * 本方案优势：
 * ===========
 * - **延迟初始化**：只在首次使用时创建连接，节省资源
 * - **单例模式**：全局共享一个连接池，避免重复创建
 * - **代理模式**：通过 Proxy 实现透明的延迟初始化
 * - **测试友好**：支持显式传入连接，便于单元测试
 */
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, type PoolConfig } from '@neondatabase/serverless'
import * as schema from './schema'

/** Schema 类型 */
type Schema = typeof schema
/** 数据库实例类型 */
export type DbInstance = ReturnType<typeof drizzle<Schema>>

/** 连接池单例 */
let _poolInstance: Pool | null = null
/** 数据库实例单例 */
let _dbInstance: DbInstance | null = null

/**
 * ensureDbInitialized - 确保数据库连接已初始化
 * 
 * 实现逻辑：
 * ========
 * 1. 检查 _dbInstance 是否已存在
 * 2. 如果不存在，从环境变量获取连接字符串
 * 3. 创建连接池和数据库实例
 * 4. 返回数据库实例
 * 
 * 为什么使用延迟初始化？
 * ====================
 * 1. **资源节省**：只有在实际需要时才创建连接
 * 2. **测试友好**：可以在测试前注入 mock 连接
 * 3. **启动速度**：应用启动时不需要等待数据库连接
 * 
 * @returns DbInstance 数据库实例
 */
function ensureDbInitialized(): DbInstance {
  if (!_dbInstance) {
    const connectionString: string | undefined = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('[server/database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.')
    }
    const poolConfig: PoolConfig = { connectionString }
    _poolInstance = new Pool(poolConfig)
    _dbInstance = drizzle(_poolInstance, { schema })
  }
  return _dbInstance
}

/**
 * CreateDbOptions - 创建数据库实例的选项
 * 
 * 设计意图：
 * =========
 * 支持自定义连接字符串和连接池，便于测试和特殊场景。
 */
export interface CreateDbOptions {
  connectionString?: string
  pool?: Pool
}

/**
 * createDb - 创建数据库实例
 * 
 * 使用场景：
 * ========
 * - 测试时创建独立的数据库实例
 * - 需要使用不同连接字符串的场景
 * - 需要自定义连接池配置的场景
 * 
 * @param options 创建选项
 * @returns DbInstance 数据库实例
 */
export function createDb(options: CreateDbOptions = {}): DbInstance {
  const connectionString: string | undefined =
    options.connectionString || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      '[server/database/connection] DATABASE_URL is missing. Either set env DATABASE_URL or pass connectionString explicitly.'
    )
  }
  const pool: Pool = options.pool || new Pool({ connectionString })
  return drizzle(pool, { schema })
}

/**
 * getDb - 获取数据库实例（单例）
 * 
 * 使用场景：
 * ========
 * - 常规数据库操作
 * - 需要共享连接池的场景
 * 
 * @returns DbInstance 数据库实例
 */
export function getDb(): DbInstance {
  return ensureDbInitialized()
}

/**
 * closeDb - 关闭数据库连接
 * 
 * 使用场景：
 * ========
 * - 应用关闭时清理资源
 * - 测试结束时清理连接
 * 
 * @returns Promise<void>
 */
export async function closeDb(): Promise<void> {
  if (_poolInstance) {
    try {
      await _poolInstance.end()
    } catch {
      // ignore errors on cleanup
    } finally {
      _poolInstance = null
      _dbInstance = null
    }
  }
}

/**
 * DbKey - 数据库操作方法名
 * 
 * 定义所有可能的数据库操作方法，用于 Proxy 拦截。
 */
type DbKey =
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'execute'
  | 'query'
  | 'run'
  | 'transaction'

/** 数据库操作方法列表 */
const dbOperations: DbKey[] = [
  'select',
  'insert',
  'update',
  'delete',
  'execute',
  'query',
  'run'
]

/**
 * db - 数据库代理实例
 * 
 * 设计意图：
 * =========
 * 通过 Proxy 实现透明的延迟初始化，使用时无需手动调用 getDb()。
 * 
 * 实现逻辑：
 * ========
 * 1. 当访问 db 的属性时，先确保数据库已初始化
 * 2. 对于操作方法（select, insert, update 等），返回绑定了实例的函数
 * 3. 对于其他属性，直接返回实例的属性
 * 
 * 为什么使用 Proxy？
 * =================
 * 1. **透明性**：调用方无需关心初始化逻辑
 * 2. **懒加载**：只有实际使用时才初始化
 * 3. **灵活性**：可以在不修改调用代码的情况下添加拦截逻辑
 * 
 * 使用方式：
 * ========
 * import { db } from '@core/database'
 * const courses = await db.select().from(coursesTable)
 */
export const db: DbInstance = new Proxy<DbInstance>({} as unknown as DbInstance, {
  get<K extends keyof DbInstance>(_target: DbInstance, prop: string | symbol, _receiver: unknown): DbInstance[K] | undefined {
    if (typeof prop === 'symbol') {
      return undefined as unknown as DbInstance[K]
    }
    const key = prop as DbKey | string
    if (dbOperations.includes(key as DbKey) || key === 'transaction') {
      const instance = ensureDbInitialized()
      const fn = instance[prop as keyof DbInstance] as unknown as (...args: unknown[]) => unknown
      if (typeof fn === 'function') {
        return ((...args: unknown[]) =>
          fn.apply(instance, args)) as unknown as DbInstance[K]
      }
      return fn as unknown as DbInstance[K]
    }
    return Reflect.get(ensureDbInitialized(), prop) as DbInstance[K]
  },

  has(_target: DbInstance, prop: string | symbol): boolean {
    return prop in ensureDbInitialized()
  },

  ownKeys(_target: DbInstance): ArrayLike<string | symbol> {
    return Object.keys(ensureDbInitialized())
  },

  getOwnPropertyDescriptor(
    _target: DbInstance,
    prop: string | symbol
  ): PropertyDescriptor | undefined {
    return Object.getOwnPropertyDescriptor(ensureDbInitialized(), prop)
  }
})

/** 导出 schema */
export { schema }

/** 默认导出 */
export default { db, getDb, createDb, closeDb, schema }
