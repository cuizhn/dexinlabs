/**
 * Drizzle ORM 配置文件
 *
 * 配置数据库连接、Schema 路径和迁移输出路径。
 * 运行命令详见 package.json scripts（drizzle:* 系列）。
 */
import { defineConfig } from 'drizzle-kit'

/** 获取数据库连接字符串（必需） */
const DATABASE_URL: string | undefined = process.env.DATABASE_URL

/** 如果未配置数据库连接字符串，抛出错误 */
if (!DATABASE_URL) {
  throw new Error('[drizzle.config] DATABASE_URL is required. Check your .env file.')
}

/** 导出 Drizzle 配置 */
export default defineConfig({
  /** Schema 定义文件路径 */
  schema: './app/database/schema.ts',
  
  /** 迁移文件输出目录 */
  out: './app/database/migrations',
  
  /** 数据库方言 */
  dialect: 'postgresql',
  
  /** 数据库连接凭证 */
  dbCredentials: {
    url: DATABASE_URL
  },
  
  /** 是否输出详细日志 */
  verbose: true,
  
  /** 是否启用严格模式 */
  strict: true
})
