/**
 * 主题切换视觉验证脚本（一次性验证用，不进入产品链路）
 *
 * 做三件事：
 * 1. 断言首屏 <html data-theme> 在绘制前已由内联脚本写好（无主题闪烁）；
 * 2. 分别在「系统浅色」「系统深色」下截图，验证默认跟随 prefers-color-scheme；
 * 3. 点击 Header 主题按钮 → 截图 → 重新加载页面 → 断言选择被持久化。
 *
 * 用法：node scripts/theme-shot.mjs [baseURL]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const baseURL = process.argv[2] ?? 'http://localhost:3000'
const outDir = 'compile/theme-shots'

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()

/** 读取 <html data-theme> */
const readTheme = page => page.evaluate(() => document.documentElement.dataset.theme)

for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({
    colorScheme: scheme,
    viewport: { width: 1280, height: 900 }
  })
  const page = await context.newPage()

  await page.goto(baseURL, { waitUntil: 'networkidle' })

  // 1) 默认跟随系统
  const initial = await readTheme(page)
  console.log(`[系统 ${scheme}] 首屏 data-theme = ${initial}  ${initial === scheme ? 'OK' : '✗ 不符合预期'}`)

  // 内联脚本必须出现在 head 中，且在任何样式表之后不依赖 JS 框架
  const hasInlineInit = await page.evaluate(() =>
    [...document.head.querySelectorAll('script')].some(s => s.textContent?.includes('dexin-theme'))
  )
  console.log(`[系统 ${scheme}] head 内联主题脚本存在 = ${hasInlineInit}`)

  await page.screenshot({ path: `${outDir}/home-system-${scheme}.png`, fullPage: false })

  // 2) 点击切换
  await page.getByRole('button', { name: '切换深色 / 浅色主题' }).click()
  const toggled = await readTheme(page)
  console.log(`[系统 ${scheme}] 点击后 data-theme = ${toggled}  ${toggled !== initial ? 'OK' : '✗ 未切换'}`)
  await page.screenshot({ path: `${outDir}/home-toggled-from-${scheme}.png`, fullPage: false })

  // 3) 刷新后保持
  await page.reload({ waitUntil: 'networkidle' })
  const afterReload = await readTheme(page)
  console.log(`[系统 ${scheme}] 刷新后 data-theme = ${afterReload}  ${afterReload === toggled ? 'OK 已持久化' : '✗ 丢失'}`)

  // 4) 课程页（Lesson 暖色暗纸）— 若无数据库连接会失败，失败不阻塞
  try {
    await page.goto(`${baseURL}/courses`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.screenshot({ path: `${outDir}/courses-${toggled}.png`, fullPage: false })
    console.log(`[系统 ${scheme}] /courses 截图完成（${toggled}）`)
  }
  catch (error) {
    console.log(`[系统 ${scheme}] /courses 跳过：${error.message.split('\n')[0]}`)
  }

  await context.close()
}

await browser.close()
console.log(`\n截图输出目录：${outDir}`)
