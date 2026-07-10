export type DocumentShape = {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

export type CourseDoc = DocumentShape & {
  cover?: string | null
  edition?: string | null
  body?: string | null
  chapters?: ChapterDoc[]
}

export type ChapterDoc = DocumentShape & {
  course?: string | null
  courseId?: number | null
  cover?: string | null
  body?: string | null
  lessons?: LessonDoc[]
  exercises?: ExerciseDoc[]
  courseRef?: CourseDoc | null
}

export type LessonDoc = DocumentShape & {
  chapter?: string | null
  chapterId?: number | null
  content?: string | null
  objectives?: string | null
  intro?: string | null
  body?: string | null
  summaryText?: string | null
  notes?: string | null
  chapterRef?: ChapterDoc | null
}

export type ExerciseDoc = DocumentShape & {
  chapter?: string | null
  chapterId?: number | null
  description?: string | null
  body?: string | null
  hint?: string | null
  answer?: string | null
  analysis?: string | null
  chapterRef?: ChapterDoc | null
}

export type AssetDoc = DocumentShape & {
  type?: string
  url: string
  mime?: string | null
  size?: number | null
  meta?: string | null
}

export const ContentTypes = {
  LESSON: 'lesson',
  CHAPTER: 'chapter',
  COURSE: 'course',
  EXERCISE: 'exercise',
  ASSET: 'asset',

  AST_NODE: {
    ROOT: 'root',
    HEADING: 'heading',
    PARAGRAPH: 'paragraph',
    TEXT: 'text',
    LINK: 'link',
    IMAGE: 'image',
    LIST: 'list',
    LIST_ITEM: 'listItem',
    CODE: 'code',
    BLOCKQUOTE: 'blockquote',
    MATH: 'math',
    TABLE: 'table'
  }
} as const

export type ContentType = typeof ContentTypes[keyof Omit<typeof ContentTypes, 'AST_NODE'>]

export type AstNodeType = typeof ContentTypes.AST_NODE[keyof typeof ContentTypes.AST_NODE]

export function createLessonShim(overrides: Partial<LessonDoc> = {}): LessonDoc {
  return {
    id: null,
    slug: '',
    title: '',
    summary: '',
    content: '',
    order: 0,
    chapter: null,
    ...overrides
  }
}




export function createChapterShim(overrides: Partial<ChapterDoc> = {}): ChapterDoc {
  return {
    id: null,
    slug: '',
    title: '',
    summary: '',
    order: 0,
    course: null,
    lessons: [],
    ...overrides
  }
}

export function createCourseShim(overrides: Partial<CourseDoc> = {}): CourseDoc {
  return {
    id: null,
    slug: '',
    title: '',
    summary: '',
    order: 0,
    chapters: [],
    ...overrides
  }
}

export default ContentTypes
