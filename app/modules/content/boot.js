import { registerQuery } from '../core/registry'
import { bootstrapParser } from './bootstraps/parser'
import { bootstrapRenderer, bootstrapTransformers } from './bootstraps/renderer'
import { bootstrapDatabase } from './bootstraps/database'
import { buildLazyQueryFacade } from './queries/lazyQuery'

/**
 * 启动内容引擎，初始化所有子模块
 */
export async function bootContentEngine() {
  // 初始化 Markdown 解析
  const parserConfig = bootstrapParser()

  // 初始化渲染和转换
  const rendererConfig = bootstrapRenderer()
  const transformerConfig = bootstrapTransformers()

  // 初始化数据库
  const databaseConfig = bootstrapDatabase()

  // 注册查询层
  const lazyQuery = buildLazyQueryFacade()
  registerQuery('default', lazyQuery, true)

  return {
    ok: true,
    registered: {
      ...parserConfig,
      ...rendererConfig,
      ...transformerConfig,
      ...databaseConfig
    }
  }
}

export default bootContentEngine
