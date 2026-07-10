export interface BySlugQuery {
  slug: string
}

export interface ByCourseQuery {
  course?: string | null
  courseId?: number | string | null
  courseSlug?: string | null
}

export interface ByChapterQuery {
  chapter?: string | null
  chapterId?: number | string | null
  chapterSlug?: string | null
}

export interface ListSortQuery {
  orderBy?: 'id' | 'order' | (string & {})
  order?: 'asc' | 'desc'
}

export interface ListPaginateQuery {
  limit?: number | string | null
  offset?: number | string | null
}

export interface ListChaptersQuery extends ByCourseQuery, ListSortQuery, ListPaginateQuery {
}

export interface ListLessonsQuery extends ByChapterQuery, ListSortQuery, ListPaginateQuery {
}

export interface ListExercisesQuery extends ByChapterQuery, ListSortQuery, ListPaginateQuery {
}

export interface NormalizedBySlugQuery {
  slug: string
  isValid: boolean
  error?: string
}

export interface NormalizedByCourseQuery {
  courseSlug?: string
  courseId?: number
  isValid: boolean
  error?: string
}

export interface NormalizedByChapterQuery {
  chapterSlug?: string
  chapterId?: number
  isValid: boolean
  error?: string
}

export interface NormalizedListSort {
  orderBy: 'id' | 'order'
  order: 'asc' | 'desc'
}

export interface NormalizedListPaginate {
  limit?: number
  offset?: number
}

export interface NormalizedListChaptersQuery extends NormalizedByCourseQuery, NormalizedListSort, NormalizedListPaginate {
}

export interface NormalizedListLessonsQuery extends NormalizedByChapterQuery, NormalizedListSort, NormalizedListPaginate {
}

export interface NormalizedListExercisesQuery extends NormalizedByChapterQuery, NormalizedListSort, NormalizedListPaginate {
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function normalizeSort(input: ListSortQuery = {}): NormalizedListSort {
  const orderBy =
    (input.orderBy === 'id' || input.orderBy === 'order')
      ? (input.orderBy as 'id' | 'order')
      : ('order' as const)
  const order =
    (input.order === 'asc' || input.order === 'desc')
      ? (input.order as 'asc' | 'desc')
      : ('asc' as const)
  return { orderBy, order }
}

function normalizePaginate(input: ListPaginateQuery = {}): NormalizedListPaginate {
  const result: NormalizedListPaginate = {}
  const limit = toNumberOrUndefined(input.limit)
  const offset = toNumberOrUndefined(input.offset)
  if (limit !== undefined && limit > 0) result.limit = limit
  if (offset !== undefined && offset >= 0) result.offset = offset
  return result
}

export function normalizeBySlug(input: string | BySlugQuery | null | undefined): NormalizedBySlugQuery {
  const slug = typeof input === 'string' ? input : (input && typeof input === 'object' ? input.slug : '')
  const clean = String(slug || '').trim()
  if (!clean) {
    return { slug: '', isValid: false, error: 'slug is required' }
  }
  return { slug: clean, isValid: true }
}

export function normalizeByCourse(input: ByCourseQuery | string | null | undefined): NormalizedByCourseQuery {
  const raw: ByCourseQuery = typeof input === 'string'
    ? { courseSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const courseSlugRaw =
    raw.courseSlug !== undefined && raw.courseSlug !== null ? raw.courseSlug : raw.course
  const courseSlug = typeof courseSlugRaw === 'string' ? courseSlugRaw.trim() : undefined
  const courseId = toNumberOrUndefined(raw.courseId)
  if (!courseSlug && courseId === undefined) {
    return { isValid: false, error: 'courseSlug or courseId is required' }
  }
  return {
    courseSlug,
    courseId,
    isValid: true
  }
}

export function normalizeByChapter(input: ByChapterQuery | string | null | undefined): NormalizedByChapterQuery {
  const raw: ByChapterQuery = typeof input === 'string'
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

export function normalizeListChapters(input: ListChaptersQuery | string | null | undefined): NormalizedListChaptersQuery {
  const raw: ListChaptersQuery = typeof input === 'string'
    ? { courseSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const byCourse = normalizeByCourse({
    course: raw.course,
    courseId: raw.courseId,
    courseSlug: raw.courseSlug
  })
  const sort = normalizeSort(raw)
  const paginate = normalizePaginate(raw)
  return {
    ...byCourse,
    ...sort,
    ...paginate
  }
}

export function normalizeListLessons(input: ListLessonsQuery | string | null | undefined): NormalizedListLessonsQuery {
  const raw: ListLessonsQuery = typeof input === 'string'
    ? { chapterSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  })
  const sort = normalizeSort(raw)
  const paginate = normalizePaginate(raw)
  return {
    ...byChapter,
    ...sort,
    ...paginate
  }
}

export function normalizeListExercises(input: ListExercisesQuery | string | null | undefined): NormalizedListExercisesQuery {
  const raw: ListExercisesQuery = typeof input === 'string'
    ? { chapterSlug: input }
    : (input && typeof input === 'object' ? input : {})
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  })
  const sort = normalizeSort(raw)
  const paginate = normalizePaginate(raw)
  return {
    ...byChapter,
    ...sort,
    ...paginate
  }
}

export const queries = {
  normalizeBySlug,
  normalizeByCourse,
  normalizeByChapter,
  normalizeListChapters,
  normalizeListLessons,
  normalizeListExercises
}

export default queries
