/**
 * 本地 Content Package 发布辅助脚本（CLI，纯 Node ESM，无 TS 依赖）
 *
 * 用法（在 dexinlabs 根目录）：
 *   # 1) 先在 dexinlabs-content 生成最新 output/content-package.json
 *        cd ../dexinlabs-content && npm run compile
 *   # 2) 启动 dexinlabs 主服务器（必须跑着）
 *        npm run dev            # http://localhost:3000
 *   # 3) 本地一键发布
 *        npm run publish:content
 *
 * 参数（环境变量）：
 *   PUBLISH_ENDPOINT   默认 http://localhost:3000/api/content-package
 *   PUBLISH_TOKEN      默认读取本仓库 .env PUBLISH_TOKEN= 行
 *   CONTENT_PACKAGE    默认 ../dexinlabs-content/output/content-package.json
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const CONTENT_PACKAGE_DEFAULT = resolve(
  ROOT, '..', 'dexinlabs-content', 'output', 'content-package.json'
)
const ENDPOINT_DEFAULT = 'http://localhost:3000/api/content-package'

// ── 从本地 .env 读 PUBLISH_TOKEN（CLI env 变量优先） ──
function readPublishTokenFromLocalEnv() {
  const envPath = join(ROOT, '.env')
  if (!existsSync(envPath)) return undefined
  const text = readFileSync(envPath, 'utf-8')
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*PUBLISH_TOKEN\s*=\s*(.+?)\s*$/)
    if (!m) continue
    let v = m[1] || ''
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (v) return v
  }
  return undefined
}

function usageAndExit(msg) {
  console.error(`✗ ${msg}`)
  console.error('')
  console.error('用法:')
  console.error('  1. 确保 dexinlabs-content/ 已 npm run compile 生成 output/content-package.json')
  console.error('  2. 确保 npm run dev 已启动（默认 http://localhost:3000）')
  console.error('  3. 确保 .env 中已设置 PUBLISH_TOKEN=<secret>（与服务端相同）')
  console.error('  4. npm run publish:content')
  console.error('')
  console.error('环境变量覆盖:')
  console.error('  PUBLISH_ENDPOINT=http://localhost:3000/api/content-package')
  console.error('  PUBLISH_TOKEN=<secret>   # 优先于 .env')
  console.error('  CONTENT_PACKAGE=/absolute/path/to/content-package.json')
  process.exit(1)
}

const pkgPath = process.env.CONTENT_PACKAGE || CONTENT_PACKAGE_DEFAULT
const endpoint = process.env.PUBLISH_ENDPOINT || ENDPOINT_DEFAULT
const tokenEnv = process.env.PUBLISH_TOKEN || readPublishTokenFromLocalEnv()

if (!tokenEnv) usageAndExit('缺少 PUBLISH_TOKEN：请在 .env 中添加 PUBLISH_TOKEN=<secret> 或通过 env 传入')
if (!existsSync(pkgPath)) usageAndExit(`找不到 Content Package：${pkgPath}（请先在 dexinlabs-content 中 npm run compile）`)

let pkgRaw
try {
  pkgRaw = readFileSync(pkgPath, 'utf-8')
  JSON.parse(pkgRaw) // 校验 JSON 语法；Body 传原文，保留换行/字段顺序
} catch (e) {
  usageAndExit(`Content Package 不是合法 JSON：${e.message}`)
}

console.log('📤 发布 Content Package')
console.log('   源文件    :', pkgPath)
console.log('   目标端点  :', endpoint)
console.log(
  '   Token     :',
  (tokenEnv.slice(0, 4) || '') + '***(' + String(tokenEnv).length + ' chars)'
)
console.log('')

const start = Date.now()
let resp
try {
  resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-publish-token': tokenEnv
    },
    body: pkgRaw
  })
} catch (e) {
  usageAndExit(
    `无法连接到 ${endpoint}（${e && e.message ? e.message : String(e)}）。请先启动 npm run dev。`
  )
}

const text = await resp.text()
let data
try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text } }

const elapsed = Date.now() - start
console.log(`响应 Status : ${resp.status} ${resp.statusText} (${elapsed}ms)`)

if (resp.status === 200) {
  console.log('✅ 发布成功')
  console.log(JSON.stringify(data, null, 2))
  process.exit(0)
} else {
  console.error('❌ 发布失败')
  console.error(JSON.stringify(data, null, 2))
  process.exit(1)
}
