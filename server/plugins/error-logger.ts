import type { NitroAppPlugin } from 'nitropack'

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Object.prototype.toString.call(v) === '[object Object]'

function stringifyErrorPayload(err: unknown): string {
  try {
    if (!err) return String(err)
    if (err instanceof Error) {
      const extras: Record<string, unknown> = {}
      for (const k of Object.keys(err)) {
        if (k !== 'message' && k !== 'stack' && k !== 'name') {
          extras[k] = (err as Record<string, unknown>)[k]
        }
      }
      const extrasStr =
        Object.keys(extras).length > 0
          ? `\n  extras: ${JSON.stringify(extras, (_k, v) => {
              try {
                if (typeof v === 'bigint') return v.toString()
                if (v instanceof Error) return `${v.name}: ${v.message}`
                return v
              } catch {
                return '[unserializable]'
              }
            }, 2)}`
          : ''
      return `${err.name || 'Error'}: ${err.message}\n  stack:\n${err.stack || '  (no stack trace)'}${extrasStr}`
    }
    if (isPlainObject(err)) {
      return JSON.stringify(err, null, 2)
    }
    return String(err)
  } catch (fallbackErr) {
    return `[failed to stringify error: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}] → ${String(err)}`
  }
}

export default <NitroAppPlugin> function (nitroApp) {
  nitroApp.hooks.hook('error', (err, context) => {
    const errStatus =
      (err && typeof err === 'object' && (err as { statusCode?: number }).statusCode) || 0
    const errCode =
      (err && typeof err === 'object' && (err as { code?: string }).code) ||
      (err && typeof err === 'object' &&
        (err as { data?: { code?: string } }).data?.code) ||
      null
    const isIntentional =
      // 4xx are client errors, intentional
      (errStatus >= 400 && errStatus < 500) ||
      // 503 from our handlers with DATABASE_URL_MISSING is expected degradation
      (errStatus === 503 && errCode === 'DATABASE_URL_MISSING')

    const ctxStr = context
      ? `\n  context: ${JSON.stringify(context, (_k, v) => {
          try {
            if (v && typeof v === 'object' && 'method' in v && 'url' in v) {
              return `${(v as { method?: string }).method || '?'} ${(v as { url?: string }).url || '?'}`
            }
            if (typeof v === 'bigint') return v.toString()
            if (v instanceof Error) return `${v.name}: ${v.message}`
            return v
          } catch {
            return '[unserializable]'
          }
        }, 2)}`
      : ''
    const payload = `${isIntentional ? '' : 'UNCAUGHT '}Nitro error${ctxStr}\n${stringifyErrorPayload(err)}`

    if (isIntentional) {
      // eslint-disable-next-line no-console
      console.debug(`[nitro:error:intentional:${errStatus}] ${payload}`)
    } else {
      // Real unexpected errors → stderr, shows up in Vercel Runtime Logs
      // eslint-disable-next-line no-console
      console.error(`[nitro:error:UNEXPECTED${context && (context as { event?: unknown }).event ? ':request' : ':global'}] ${payload}`)
    }
  })

  nitroApp.hooks.hook('request', (event) => {
    try {
      const url = event?.node?.req?.url ?? (event as { path?: string }).path ?? '?'
      const method = event?.node?.req?.method ?? (event as { method?: string }).method ?? '?'
      // eslint-disable-next-line no-console
      console.debug(`[nitro:request] → ${method} ${url}`)
    } catch {
      /* ignore logging errors */
    }
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    try {
      const url = event?.node?.req?.url ?? (event as { path?: string }).path ?? '?'
      const method = event?.node?.req?.method ?? (event as { method?: string }).method ?? '?'
      const statusCode =
        event?.node?.res?.statusCode ??
        (event as { res?: { statusCode?: number } }).res?.statusCode ??
        0
      // eslint-disable-next-line no-console
      console.debug(`[nitro:afterResponse] ← ${method} ${url} → ${statusCode}`)
    } catch {
      /* ignore logging errors */
    }
  })
}
