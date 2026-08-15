import { chromium } from 'playwright'

const EXEC = 'C:/Users/cui/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'

const LESSON = 'http://localhost:3000/courses/linear-equations/intro-to-linear-equations'

const shots = [
  { name: 'home-desktop', url: 'http://localhost:3000/', viewport: { width: 1440, height: 900 }, full: true },
  { name: 'home-mobile', url: 'http://localhost:3000/', viewport: { width: 390, height: 844 }, full: true },
  { name: 'lesson-desktop', url: LESSON, viewport: { width: 1440, height: 900 }, full: true },
  { name: 'lesson-mobile', url: LESSON, viewport: { width: 390, height: 844 }, full: true },
]

for (const s of shots) {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] })
  const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: 2 })
  await page.goto(s.url, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(1500)
  const out = `c:/Users/cui/Documents/www/dexinlabs/screenshots/${s.name}.png`
  await page.screenshot({ path: out, fullPage: s.full })
  console.log('saved', out)
  await browser.close()
}
console.log('ALL DONE')
