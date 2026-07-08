export function slugify(text = '') {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function pick(obj = {}, keys = []) {
  const out = {}
  for (const k of keys) if (k in obj) out[k] = obj[k]
  return out
}

export function omit(obj = {}, keys = []) {
  const out = { ...obj }
  for (const k of keys) delete out[k]
  return out
}

export function groupBy(list = [], keyFn) {
  const map = new Map()
  for (const item of list) {
    const k = typeof keyFn === 'function' ? keyFn(item) : item?.[keyFn]
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(item)
  }
  return map
}

export function sortBy(list = [], key, dir = 'asc') {
  const sorted = [...list].sort((a, b) => {
    const av = typeof key === 'function' ? key(a) : a?.[key]
    const bv = typeof key === 'function' ? key(b) : b?.[key]
    if (av < bv) return -1
    if (av > bv) return 1
    return 0
  })
  return dir === 'desc' ? sorted.reverse() : sorted
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function estimateReadingMinutes(text = '', { cnWPM = 300, enWPM = 200 } = {}) {
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const words = text.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(cjk / cnWPM + words / enWPM))
}

export function makeExcerpt(text = '', limit = 140) {
  const plain = String(text || '')
    .replace(/[#*`>\[\]()_~\n-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > limit ? plain.slice(0, limit) + '…' : plain
}

export default {
  slugify, pick, omit, groupBy, sortBy, clamp, estimateReadingMinutes, makeExcerpt
}
