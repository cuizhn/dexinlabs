/**
 * ESLint 配置文件
 *
 * 使用 @nuxt/eslint 提供的 Nuxt 预设（包含 Vue、TypeScript 规则），
 * 并通过 eslint-config-prettier 禁用与 Prettier 冲突的格式化规则。
 */
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt(
  eslintConfigPrettier,
  {
    // 忽略工具生成/缓存目录，避免对脚手架产物做无意义的 lint。
    // 与 .vitepress/cache 同类：属于外部工具产物，非项目源码。
    ignores: [
      '.qoder/**',
      '**/.vitepress/cache/**',
      'lessons/.vitepress/cache/**'
    ]
  }
)
