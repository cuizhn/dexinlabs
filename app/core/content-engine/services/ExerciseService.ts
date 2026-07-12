import { exerciseRepository } from '@core/database/repositories'
import type { ExerciseRepository, ExerciseListByChapterRow } from '@core/database/repositories'
import type { Exercise } from '../models/index'
import { queries } from '../queries/index'

type SelectExercise = Exercise

export interface ExerciseServiceDeps {
  exercises?: ExerciseRepository
}

export class ExerciseService {
  exercises: ExerciseRepository

  constructor({ exercises = exerciseRepository }: ExerciseServiceDeps = {}) {
    this.exercises = exercises
  }

  async listByChapter(chapterSlug: string): Promise<ExerciseListByChapterRow[]> {
    const q = queries.normalizeByChapter(chapterSlug)
    if (!q.isValid) return []
    return this.exercises.listByChapter(q.chapterSlug || String(chapterSlug))
  }

  async getBySlug(slug: string): Promise<SelectExercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    return this.exercises.getBySlug(q.slug)
  }

  async listAll(): Promise<SelectExercise[]> {
    return this.exercises.list()
  }

  async create(
    data: Partial<SelectExercise> & { slug: string; title: string }
  ): Promise<SelectExercise | null> {
    const q = queries.normalizeBySlug(data.slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    if (!String(data.title || '').trim()) throw new Error('title is required')
    const chapterQ = queries.normalizeByChapter({ chapterSlug: data.chapter, chapterId: data.chapterId })
    const chapterSlug = chapterQ.isValid && chapterQ.chapterSlug ? chapterQ.chapterSlug :
      (typeof data.chapter === 'string' ? data.chapter : undefined)
    const chapterId = chapterQ.isValid && chapterQ.chapterId ? chapterQ.chapterId :
      (data.chapterId !== undefined && data.chapterId !== null ? Number(data.chapterId) : undefined)
    const payload: Partial<SelectExercise> = {
      slug: q.slug,
      title: String(data.title).trim(),
      summary: typeof data.summary === 'string' ? data.summary : null as unknown as SelectExercise['summary'],
      description: typeof data.description === 'string' ? data.description : null as unknown as SelectExercise['description'],
      body: typeof data.body === 'string' ? data.body : null as unknown as SelectExercise['body'],
      hint: typeof data.hint === 'string' ? data.hint : null as unknown as SelectExercise['hint'],
      answer: typeof data.answer === 'string' ? data.answer : null as unknown as SelectExercise['answer'],
      analysis: typeof data.analysis === 'string' ? data.analysis : null as unknown as SelectExercise['analysis'],
      chapter: typeof chapterSlug === 'string' ? chapterSlug : null as unknown as SelectExercise['chapter'],
      chapterId: typeof chapterId === 'number' ? chapterId : null as unknown as SelectExercise['chapterId'],
      order: typeof data.order === 'number' ? data.order : 0
    }
    return this.exercises.create(payload as unknown as Parameters<typeof this.exercises.create>[0])
  }

  async update(slug: string, patch: Partial<SelectExercise>): Promise<SelectExercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    const existing = await this.exercises.getBySlug(q.slug)
    if (!existing) return null
    const clean: Partial<SelectExercise> = {}
    const keys: (keyof SelectExercise)[] = [
      'title', 'summary', 'description', 'body', 'hint', 'answer', 'analysis',
      'chapter', 'chapterId', 'order'
    ]
    for (const k of keys) {
      if ((patch as unknown as Record<string, unknown>)[k] !== undefined) {
        ;(clean as unknown as Record<string, unknown>)[k] = (patch as unknown as Record<string, unknown>)[k]
      }
    }
    return this.exercises.updateBySlug(q.slug, clean as unknown as Parameters<typeof this.exercises.updateBySlug>[1])
  }

  async remove(slug: string): Promise<{ rowCount: number | null }> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    return this.exercises.deleteBySlug(q.slug)
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
