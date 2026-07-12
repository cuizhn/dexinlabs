import type { DebounceFunction } from '../types'

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number = 3000
): DebounceFunction<T> {
  let timerId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args
    if (timerId != null) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      timerId = null
      if (lastArgs != null) {
        try {
          fn(...lastArgs)
        } finally {
        }
      }
    }, waitMs)
  }) as DebounceFunction<T>

  debounced.cancel = () => {
    if (timerId != null) {
      clearTimeout(timerId)
      timerId = null
    }
    lastArgs = null
  }

  debounced.flush = () => {
    if (timerId != null) {
      clearTimeout(timerId)
      timerId = null
    }
    if (lastArgs != null) {
      try {
        fn(...lastArgs)
      } finally {
        lastArgs = null
      }
    }
  }

  return debounced
}

export const DEFAULT_AUTOSAVE_DELAY_MS = 3000
