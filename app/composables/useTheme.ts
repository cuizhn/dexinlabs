/**
 * useTheme - 全站日夜主题（浅色 / 深色）状态管理
 *
 * 设计约束：
 * - 主题的唯一表达是 <html data-theme="light|dark">，
 *   所有视觉变化由 assets/css/variables.css 的 token 覆盖层完成，
 *   组件不需要感知主题，也不引入任何 UI 框架；
 * - 默认跟随系统 prefers-color-scheme；
 * - 用户主动切换后写入 localStorage，此后不再跟随系统（刷新保持用户选择）；
 * - 首屏 data-theme 由 nuxt.config 注入的 head 内联脚本在绘制前写入，
 *   本文件只负责"接管"已有值，因此不会出现浅色闪一下再变深色的问题。
 *
 * SSR 说明：服务端无法得知用户主题，SSR 输出固定为浅色 token；
 * 因此切换按钮的图标形态由 CSS 依据 data-theme 决定，而非依赖组件状态，
 * 避免水合前后图标不一致。
 */

/** 主题模式：仅两态，点击即在两者之间切换 */
export type ThemeMode = 'light' | 'dark'

/** localStorage 键名：仅在用户主动切换后写入 */
const STORAGE_KEY = 'dexin-theme'

/** 系统深色偏好的媒体查询串 */
const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * 读取用户此前主动保存的主题选择
 *
 * @returns 已保存的主题；从未主动切换过则返回 null（表示应跟随系统）
 */
function readStoredTheme(): ThemeMode | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  }
  catch {
    // 隐私模式 / 禁用存储时静默降级为"跟随系统"
    return null
  }
}

/**
 * 读取当前系统主题偏好
 *
 * @returns 系统偏好深色时返回 'dark'，否则 'light'
 */
function readSystemTheme(): ThemeMode {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/**
 * useTheme - 提供当前主题与切换能力
 *
 * 需在组件 setup 中调用（内部使用了生命周期钩子注册系统主题监听）。
 *
 * @returns theme 当前主题（响应式）、isDark 是否深色、toggle 切换主题
 */
export function useTheme() {
  /** 跨组件共享的主题状态；SSR 阶段固定为浅色 */
  const theme = useState<ThemeMode>('dexin-theme', () => 'light')

  /** 是否深色 */
  const isDark = computed(() => theme.value === 'dark')

  /**
   * 应用主题到 <html> 并同步状态
   *
   * @param next 目标主题
   * @param persist 是否写入 localStorage（仅用户主动切换时为 true）
   */
  function applyTheme(next: ThemeMode, persist: boolean): void {
    theme.value = next
    document.documentElement.dataset.theme = next

    if (!persist) return

    try {
      localStorage.setItem(STORAGE_KEY, next)
    }
    catch {
      // 存储不可用时仅本次会话生效，不影响主题切换本身
    }
  }

  /** 在浅色与深色之间切换，并持久化用户选择 */
  function toggle(): void {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark', true)
  }

  onMounted(() => {
    // 首屏的 data-theme 已由内联脚本写好，这里以 DOM 为准接管状态，
    // 避免与内联脚本的判定结果产生分歧；
    // 若内联脚本因故未执行，则在此按"存储优先、系统兜底"重新判定一次
    const applied = document.documentElement.dataset.theme
    applyTheme(
      applied === 'dark' || applied === 'light'
        ? applied
        : readStoredTheme() ?? readSystemTheme(),
      false
    )

    const media = window.matchMedia(DARK_QUERY)

    /** 系统主题变化：仅在用户从未主动选择时跟随 */
    const handleSystemChange = (event: MediaQueryListEvent): void => {
      if (readStoredTheme() !== null) return
      applyTheme(event.matches ? 'dark' : 'light', false)
    }

    media.addEventListener('change', handleSystemChange)

    onUnmounted(() => {
      media.removeEventListener('change', handleSystemChange)
    })
  })

  return { theme, isDark, toggle }
}
