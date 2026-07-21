/**
 * Markdown 插件系统的类型定义
 */

/** Markdown 处理插件的注册描述 */
export interface MarkdownPlugin {
  /** 插件唯一标识 */
  name: string
  /** remark 阶段的插件函数（unified 插件签名差异大，使用 any 兼容） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  remark?: any
  /** rehype 阶段的插件函数（同上，rehype 插件签名同样多样） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rehype?: any
  /** 插件执行顺序，数值越小越先执行（默认 100） */
  order?: number
  /** 传递给插件的配置项（不同插件接受对象、数组等不同类型） */
  options?: unknown
}
