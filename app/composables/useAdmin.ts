export interface AdminAPIResponse<T = unknown> {
  ok: boolean
  data?: T
  rowCount?: number | null
}

export interface AdminListParams {
  chapter?: string
}

function apiBasePath(resource: 'course' | 'chapter' | 'lesson' | 'exercise'): string {
  return `/api/${resource}`
}

async function safeFetch<T = unknown>(
  url: string,
  options: Record<string, unknown> = {}
): Promise<AdminAPIResponse<T>> {
  try {
    const resp = await $fetch<unknown>(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(((options.headers as Record<string, string>) || {}))
      }
    }) as AdminAPIResponse<T>
    return resp
  } catch (e: unknown) {
    const msg = e instanceof Error
      ? e.message
      : (typeof (e as { statusMessage?: unknown })?.statusMessage === 'string'
        ? String((e as { statusMessage: string }).statusMessage)
        : String(e))
    return { ok: false, rowCount: null, data: undefined as T, error: msg } as AdminAPIResponse<T> & { error: string }
  }
}

export function useAdmin() {
  async function listCourses() {
    return safeFetch<unknown[]>('/api/admin/courses')
  }

  async function listChapters() {
    return safeFetch<unknown[]>('/api/admin/chapters')
  }

  async function listLessons(params?: AdminListParams) {
    const qs = params && params.chapter ? `?chapter=${encodeURIComponent(params.chapter)}` : ''
    return safeFetch<unknown[]>(`/api/lesson${qs}`)
  }

  async function listExercises(params?: AdminListParams) {
    const qs = params && params.chapter ? `?chapter=${encodeURIComponent(params.chapter)}` : ''
    return safeFetch<unknown[]>(`/api/exercise${qs}`)
  }

  async function createResource(
    resource: 'course' | 'chapter' | 'lesson' | 'exercise',
    payload: Record<string, unknown>
  ) {
    return safeFetch(apiBasePath(resource), {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async function updateResource(
    resource: 'course' | 'chapter' | 'lesson' | 'exercise',
    slug: string,
    payload: Record<string, unknown>
  ) {
    return safeFetch(`${apiBasePath(resource)}/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async function removeResource(
    resource: 'course' | 'chapter' | 'lesson' | 'exercise',
    slug: string
  ) {
    return safeFetch(`${apiBasePath(resource)}/${encodeURIComponent(slug)}`, {
      method: 'DELETE'
    })
  }

  async function getResourceBySlug(
    resource: 'course' | 'chapter' | 'lesson' | 'exercise',
    slug: string
  ) {
    return safeFetch(`${apiBasePath(resource)}/${encodeURIComponent(slug)}`, { method: 'GET' })
  }

  return {
    listCourses,
    listChapters,
    listLessons,
    listExercises,
    createResource,
    updateResource,
    removeResource,
    getResourceBySlug
  }
}

export default useAdmin
