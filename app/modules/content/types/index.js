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
}

export function createLessonShim(overrides = {}) {
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

export function createChapterShim(overrides = {}) {
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

export function createCourseShim(overrides = {}) {
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
