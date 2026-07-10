import process from 'node:process'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'
import * as yaml from 'js-yaml'

import { closeDb } from '../app/core/database'
import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '../app/core/database/repositories/index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

function loadDotenv() {
  const envFile = path.join(PROJECT_ROOT, '.env')
  if (!fs.existsSync(envFile)) return
  const raw = fs.readFileSync(envFile, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
    if (!(key in process.env)) process.env[key] = value
  }
}

function parseFrontmatter(text) {
  if (text == null) return { data: {}, content: '' }
  const str = String(text)
  const m = str.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, content: str }
  try {
    const data = yaml.load(m[1]) || {}
    return {
      data: typeof data === 'object' && !Array.isArray(data) ? data : {},
      content: m[2]
    }
  } catch (e) {
    return { data: {}, content: str }
  }
}

function deriveSlugFromFile(file, fallback) {
  const base = path.basename(file, path.extname(file))
  if (base && base !== 'index') return base
  if (fallback) return fallback
  return base
}

function pick(obj, keys) {
  const out = {}
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      out[k] = obj[k]
    }
  }
  return out
}

async function syncCourses(stats) {
  const pattern = path.resolve(PROJECT_ROOT, 'content/course/**/*.yml').replace(/\\/g, '/')
  const files = await fg(pattern)
  stats.course.files = files.length
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8')
      const data = yaml.load(raw) || {}
      const fm = typeof data === 'object' && !Array.isArray(data) ? data : {}
      const slug = fm.slug || deriveSlugFromFile(file)
      if (!slug) {
        stats.course.skipped.push(file + ' (missing slug)')
        continue
      }
      const payload = pick(fm, [
        'slug', 'title', 'summary', 'order', 'cover', 'edition', 'body'
      ])
      payload.slug = slug
      if (!payload.title) payload.title = slug
      if (payload.order != null) payload.order = Number(payload.order) || 0
      const saved = await courseRepository.upsert(payload)
      if (saved) stats.course.ok.push(file + ' -> ' + slug)
      else stats.course.skipped.push(file)
    } catch (e) {
      stats.course.errors.push(file + ': ' + (e?.message || String(e)))
    }
  }
}

async function syncChapters(stats) {
  const pattern = path.resolve(PROJECT_ROOT, 'content/chapter/**/*.yml').replace(/\\/g, '/')
  const files = await fg(pattern)
  stats.chapter.files = files.length
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8')
      const data = yaml.load(raw) || {}
      const fm = typeof data === 'object' && !Array.isArray(data) ? data : {}
      const slug = fm.slug || deriveSlugFromFile(file)
      if (!slug) {
        stats.chapter.skipped.push(file + ' (missing slug)')
        continue
      }
      const payload = pick(fm, [
        'slug', 'title', 'summary', 'order', 'course', 'cover', 'body'
      ])
      payload.slug = slug
      if (!payload.title) payload.title = slug
      if (payload.order != null) payload.order = Number(payload.order) || 0
      const saved = await chapterRepository.upsert(payload)
      if (saved) stats.chapter.ok.push(file + ' -> ' + slug)
      else stats.chapter.skipped.push(file)
    } catch (e) {
      stats.chapter.errors.push(file + ': ' + (e?.message || String(e)))
    }
  }
}

async function syncLessons(stats) {
  const pattern = path.resolve(PROJECT_ROOT, 'content/lesson/**/*.md').replace(/\\/g, '/')
  const files = await fg(pattern)
  stats.lesson.files = files.length
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8')
      const { data, content } = parseFrontmatter(raw)
      const slug = data.slug || deriveSlugFromFile(file)
      if (!slug) {
        stats.lesson.skipped.push(file + ' (missing slug)')
        continue
      }
      const payload = pick(data, [
        'slug', 'title', 'summary', 'order', 'chapter',
        'objectives', 'intro', 'summaryText', 'notes', 'body'
      ])
      payload.slug = slug
      if (!payload.title) payload.title = slug
      if (payload.order != null) payload.order = Number(payload.order) || 0
      if (!payload.body && content) payload.body = content
      const saved = await lessonRepository.upsert(payload)
      if (saved) stats.lesson.ok.push(file + ' -> ' + slug)
      else stats.lesson.skipped.push(file)
    } catch (e) {
      stats.lesson.errors.push(file + ': ' + (e?.message || String(e)))
    }
  }
}

function printStats(stats) {
  const total =
    stats.course.files + stats.chapter.files + stats.lesson.files
  const ok =
    stats.course.ok.length + stats.chapter.ok.length + stats.lesson.ok.length
  const skipped =
    stats.course.skipped.length + stats.chapter.skipped.length + stats.lesson.skipped.length
  const errors =
    stats.course.errors.length + stats.chapter.errors.length + stats.lesson.errors.length

  console.log('\n=== content sync summary ===')
  console.log('  scanned   :', total)
  console.log('  upserted  :', ok)
  console.log('  skipped   :', skipped)
  console.log('  errors    :', errors)

  for (const kind of ['course', 'chapter', 'lesson']) {
    const s = stats[kind]
    if (s.ok.length) {
      console.log(`\n[${kind}] upserted (${s.ok.length}):`)
      for (const line of s.ok) console.log('  - ' + line)
    }
    if (s.skipped.length) {
      console.log(`\n[${kind}] skipped (${s.skipped.length}):`)
      for (const line of s.skipped) console.log('  ! ' + line)
    }
    if (s.errors.length) {
      console.log(`\n[${kind}] errors (${s.errors.length}):`)
      for (const line of s.errors) console.log('  X ' + line)
    }
  }
  console.log('============================\n')
}

async function main() {
  loadDotenv()

  if (!process.env.DATABASE_URL) {
    console.error('[content/sync] DATABASE_URL missing. Set env variable or create a .env file.')
    process.exitCode = 2
    return
  }

  const stats = {
    course: { files: 0, ok: [], skipped: [], errors: [] },
    chapter: { files: 0, ok: [], skipped: [], errors: [] },
    lesson: { files: 0, ok: [], skipped: [], errors: [] }
  }

  try {
    await syncCourses(stats)
    await syncChapters(stats)
    await syncLessons(stats)
  } catch (fatal) {
    console.error('[content/sync] FATAL:', fatal?.message || fatal)
    process.exitCode = 1
  } finally {
    printStats(stats)
    try {
      await closeDb()
    } catch {
      // ignore cleanup errors
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}

export { main, loadDotenv, parseFrontmatter }
export default main
