/**
 * drizzle.config.ts - Drizzle ORM 配置文件
 * 
 * 设计意图：
 * =========
 * 配置 Drizzle ORM 的数据库连接、Schema 路径、迁移输出路径等参数。
 * 
 * 为什么使用 Drizzle ORM？
 * =====================
 * 1. **类型安全**：基于 TypeScript 的类型推断，编译时就能发现类型错误
 * 2. **零配置迁移**：自动生成 SQL 迁移文件
 * 3. **性能**：编译时生成 SQL，运行时开销小
 * 4. **灵活性**：支持 raw SQL 和 ORM 两种方式
 * 
 * 替代方案对比：
 * =============
 * | ORM | 优点 | 缺点 |
 * |-----|------|------|
 * | **Drizzle** | 类型安全，性能好，迁移方便 | 生态相对较小 |
 * | Prisma | 生态成熟，文档完善 | 运行时开销大，类型不够灵活 |
 * | TypeORM | 功能全面 | 类型推断弱，学习曲线陡峭 |
 * 
 * 本方案优势：
 * ===========
 * - **类型安全**：所有查询都有完整的类型支持
 * - **性能优秀**：编译时生成 SQL，避免运行时解析
 * - **迁移简单**：自动生成迁移文件，支持增量迁移
 * 
 * 配置说明：
 * =========
 * - schema: Schema 定义文件路径
 * - out: 迁移文件输出目录
 * - dialect: 数据库方言（postgresql）
 * - dbCredentials: 数据库连接凭证
 * - verbose: 是否输出详细日志
 * - strict: 是否启用严格模式
 * 
 * 使用命令：
 * ========
 * npm run drizzle:generate  # 生成迁移文件
 * npm run drizzle:migrate   # 执行迁移
 * npm run drizzle:push      # 推送 Schema 到数据库
 * npm run drizzle:studio    # 打开数据库管理界面
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
