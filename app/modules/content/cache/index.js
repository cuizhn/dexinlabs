const __cache = new Map()
const __timers = new Map()

export function setCache(key, value, ttlMs = 0) {
  __cache.set(key, { value, ttlMs, setAt: Date.now() })
  if (ttlMs > 0) {
    if (__timers.has(key)) clearTimeout(__timers.get(key))
    const timer = setTimeout(() => deleteCache(key), ttlMs)
    __timers.set(key, timer)
    if (typeof timer.unref === 'function') timer.unref()
  }
  return value
}

export function getCache(key, fallback = undefined) {
  if (!__cache.has(key)) return fallback
  const entry = __cache.get(key)
  if (entry.ttlMs > 0 && Date.now() - entry.setAt > entry.ttlMs) {
    deleteCache(key)
    return fallback
  }
  return entry.value
}

export function hasCache(key) {
  if (!__cache.has(key)) return false
  const entry = __cache.get(key)
  if (entry.ttlMs > 0 && Date.now() - entry.setAt > entry.ttlMs) {
    deleteCache(key)
    return false
  }
  return true
}

export function deleteCache(key) {
  __cache.delete(key)
  if (__timers.has(key)) {
    clearTimeout(__timers.get(key))
    __timers.delete(key)
  }
}

export function clearAllCache() {
  __cache.clear()
  for (const t of __timers.values()) clearTimeout(t)
  __timers.clear()
}

export function cacheKey(...parts) {
  return parts.map(p => (p == null ? 'null' : String(p))).join('::')
}

export function createCacheLayer({ prefix = 'ce', ttl = 0 } = {}) {
  return {
    get(k, fb) { return getCache(`${prefix}:${k}`, fb) },
    set(k, v, t) { return setCache(`${prefix}:${k}`, v, t ?? ttl) },
    has(k) { return hasCache(`${prefix}:${k}`) },
    delete(k) { deleteCache(`${prefix}:${k}`) },
    clear() {
      const prefixKey = `${prefix}:`
      for (const k of Array.from(__cache.keys())) {
        if (k.startsWith(prefixKey)) deleteCache(k)
      }
    }
  }
}

export default {
  setCache, getCache, hasCache, deleteCache, clearAllCache, cacheKey, createCacheLayer
}
