/**
 * 数据库模块的公共入口
 *
 * 统一导出表结构定义和数据库连接管理函数。
 */
export * from './schema'

export {
  getDb,
  closeDb,
  type DbInstance
} from './connection'
