import path from 'node:path'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const rootDir = process.cwd()
const funcDirs = [
  path.join(rootDir, '.vercel', 'output', 'functions', '__fallback.func'),
  path.join(rootDir, '.output', 'server')
]

for (const dir of funcDirs) {
  if (!fs.existsSync(dir)) continue
  const pkgPath = path.join(dir, 'package.json')
  if (!fs.existsSync(pkgPath)) continue

  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  } catch {
    continue
  }

  const deps = pkg.dependencies || {}
  const depCount = Object.keys(deps).length
  if (depCount === 0) {
    console.log(`[postbuild] ${path.relative(rootDir, dir)}/package.json has no deps, skipping install.`)
    continue
  }

  const nodeModulesDir = path.join(dir, 'node_modules')
  const markerFile = path.join(nodeModulesDir, '.deps-installed.lock')
  let installed = false
  if (fs.existsSync(markerFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(markerFile, 'utf-8'))
      installed = existing && JSON.stringify(existing.deps || {}) === JSON.stringify(deps)
    } catch {
      installed = false
    }
  }

  if (installed) {
    console.log(`[postbuild] ${path.relative(rootDir, dir)}/node_modules already up-to-date (${depCount} deps), skipping.`)
    continue
  }

  console.log(`[postbuild] Installing ${depCount} runtime deps into ${path.relative(rootDir, dir)}/ ...`)
  const result = spawnSync(
    'npm',
    ['install', '--no-audit', '--no-fund', '--omit=dev', '--no-package-lock', '--ignore-scripts'],
    {
      cwd: dir,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    }
  )

  if (result.status !== 0) {
    console.error(`[postbuild] Failed to install deps into ${dir} (exit code ${result.status}).`)
    process.exitCode = result.status || 1
    continue
  }

  try {
    fs.mkdirSync(nodeModulesDir, { recursive: true })
    fs.writeFileSync(
      markerFile,
      JSON.stringify({ installedAt: new Date().toISOString(), deps }, null, 2),
      'utf-8'
    )
  } catch {
    /* ignore lock file write errors */
  }

  console.log(`[postbuild] Done. ${depCount} deps installed.`)
}
