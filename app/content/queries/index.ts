/**
 * 查询参数规范化模块
 * 
 * 只保留实际被业务使用的规范化函数。
 */

export interface NormalizedBySlugQuery {
  slug: string
  isValid: boolean
  error?: string
}

export interface NormalizedListChaptersQuery {
  courseSlug?: string
  courseId?: number
  isValid: boolean
  error?: string
  orderBy: 'id' | 'order'
  order: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface NormalizedByChapterQuery {
  chapterSlug?: string
  chapterId?: number
  isValid: boolean
  error?: string
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function normalizeBySlug(input: string | { slug: string } | null | undefined): NormalizedBySlugQuery {
  const slug = typeof input === 'string' ? input : (input && typeof input === 'object' ? input.slug : '')
  const clean = String(slug || '').trim()
  if (!clean) {
    return { slug: '', isValid: false, error: 'slug is required' }
  }
  return { slug: clean, isValid: true }
}

export function normalizeByChapter(input: { chapterSlug?: string | null; chapterId?: number | string | null; chapter?: string | null } | string | null | undefined): NormalizedByChapterQuery {
  const raw = typeof input === 'string'
    ? { chapterSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const chapterSlugRaw =
    raw.chapterSlug !== undefined && raw.chapterSlug !== null ? raw.chapterSlug : raw.chapter
  const chapterSlug = typeof chapterSlugRaw === 'string' ? chapterSlugRaw.trim() : undefined
  const chapterId = toNumberOrUndefined(raw.chapterId)
  if (!chapterSlug && chapterId === undefined) {
    return { isValid: false, error: 'chapterSlug or chapterId is required' }
  }
  return {
    chapterSlug,
    chapterId,
    isValid: true
  }
}

export function normalizeListChapters(input: { course?: string | null; courseId?: number | string | null; courseSlug?: string | null; orderBy?: string; order?: string; limit?: number | string | null; offset?: number | string | null } | string | null | undefined): NormalizedListChaptersQuery {
  const raw = typeof input === 'string'
    ? { courseSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const courseSlugRaw =
    raw.courseSlug !== undefined && raw.courseSlug !== null ? raw.courseSlug : raw.course
  const courseSlug = typeof courseSlugRaw === 'string' ? courseSlugRaw.trim() : undefined
  const courseId = toNumberOrUndefined(raw.courseId)
  if (!courseSlug && courseId === undefined) {
    return { isValid: false, error: 'courseSlug or courseId is required', orderBy: 'order', order: 'asc' }
  }
  const orderBy = (raw.orderBy === 'id' || raw.orderBy === 'order') ? (raw.orderBy as 'id' | 'order') : 'order'
  const order = (raw.order === 'asc' || raw.order === 'desc') ? (raw.order as 'asc' | 'desc') : 'asc'
  const limit = toNumberOrUndefined(raw.limit)
  const offset = toNumberOrUndefined(raw.offset)
  return {
    courseSlug,
    courseId,
    isValid: true,
    orderBy,
    order,
    ...(limit !== undefined && limit > 0 ? { limit } : {}),
    ...(offset !== undefined && offset >= 0 ? { offset } : {})
  }
}

export const queries = {
  normalizeBySlug,
  normalizeByChapter,
  normalizeListChapters
}

export default queries
