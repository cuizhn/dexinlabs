/**
 * Frontmatter extraction — pure function, no framework deps.
 * Migrated from app/render/parsers/frontmatter.js
 */

export interface FrontmatterResult {
  data: Record<string, unknown>
  content: string
}

export function parseFrontmatter(raw: string = ''): FrontmatterResult {
  if (typeof raw !== 'string') return { data: (raw as Record<string, unknown>) || {}, content: '' }
  const marker = '---'
  const start = raw.indexOf(marker)
  if (start !== 0) return { data: {}, content: raw }
  const end = raw.indexOf(marker, marker.length)
  if (end === -1) return { data: {}, content: raw }
  const block = raw.slice(marker.length, end).trim()
  const content = raw.slice(end + marker.length)
  const data: Record<string, unknown> = {}
  block.split(/\r?\n/).forEach(line => {
    const idx = line.indexOf(':')
    if (idx === -1) return
    const k = line.slice(0, idx).trim()
    let v = line.slice(idx + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (k) data[k] = v
  })
  return { data, content }
}

export default parseFrontmatter
