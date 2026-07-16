/**
 * Database 模块统一导出
 * 
 * 设计意图：
 * =========
 * 作为 Database 层的统一入口（Barrel 文件），提供 Schema 和连接管理的导出。
 * 
 * 为什么需要 Barrel 文件？
 * =====================
 * 1. **统一入口**：上层代码只需从一个路径导入所有 Database 相关功能
 * 2. **减少导入语句**：避免重复的 import 语句
 * 3. **隐藏内部结构**：上层代码不依赖具体文件位置
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **Barrel 文件** | 统一入口，减少重复导入 | 增加一层转发 |
 * | 直接导入具体文件 | 简单直接 | 导入语句冗长，依赖文件位置 |
 * 
 * 本方案优势：
 * ===========
 * - **统一入口**：`import { db, schema } from '@database'`
 * - **类型导出**：同时导出类型定义
 * - **结构清晰**：Schema 和连接管理独立文件，通过 barrel 统一导出
 * 
 * 使用方式：
 * ========
 * import { db, schema, getDb, createDb, closeDb } from '@database'
 */

/** Schema 定义导出 */
export * from './schema'

/** 连接管理导出 */
export {
  getDb,
  createDb,
  closeDb,
  db,
  type DbInstance,
  type CreateDbOptions
} from './connection'
