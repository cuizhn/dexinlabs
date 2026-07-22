/**
 * useRouteParam - 路由参数安全提取组合式函数
 *
 * Nuxt 的 useRoute() 返回的 params 类型为 Record<string, string | string[] | undefined>，
 * 对于 [slug] 形式的单段动态路由，实际运行时始终为 string。
 * 此函数统一处理类型收窄，避免模板和逻辑中重复 Array.isArray 判断。
 */

/**
 * useRouteParam - 从当前路由中安全提取单个参数值
 *
 * 单段动态路由（如 [topic]、[lesson]）在运行时始终返回 string，
 * 但 Nuxt 类型系统将其标注为 string | string[] | undefined。
 * 此函数统一处理这三种情况，返回 string | undefined。
 *
 * @param name 路由参数名称
 * @returns 提取后的字符串值，不存在时返回 undefined
 */
export function useRouteParam(name: string): string | undefined {
  const route = useRoute()
  const param = route.params[name]
  if (Array.isArray(param)) return param[0]
  return param
}
