import { chromium } from 'playwright'

const EXEC = 'C:/Users/cui/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'

const shots = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, full: true },
  { name: 'mobile', viewport: { width: 390, height: 844 }, full: true },
]

const url = process.env.SHOT_URL || 'http://localhost:3000/'

for (const s of shots) {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] })
  const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(900)
  const out = `c:/Users/cui/Documents/www/dexinlabs/screenshots/home-${s.name}.png`
  await page.screenshot({ path: out, fullPage: s.full })
  console.log('saved', out)
  await browser.close()
}
console.log('ALL DONE')
