/**
 * 共享类型定义
 * 
 * 设计意图：
 * =========
 * 定义跨模块共享的数据类型，避免类型重复定义。
 * 
 * 职责边界：
 * =========
 * 1. 定义文档形状（DocumentShape）基础类型
 * 2. 定义各内容类型的文档接口（CourseDoc, ChapterDoc, LessonDoc, ExerciseDoc, AssetDoc）
 * 3. 定义内容类型常量（ContentTypes）
 * 4. 提供文档创建辅助函数（createLessonShim, createChapterShim, createCourseShim）
 * 
 * 为什么需要共享类型？
 * ==================
 * 1. **类型复用**：多个模块使用相同的数据结构
 * 2. **类型一致性**：避免不同模块定义相似但不一致的类型
 * 3. **解耦**：各模块依赖共享类型，不直接依赖对方的类型定义
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **共享类型文件** | 类型复用，一致性好 | 需要维护共享文件 |
 * | 各模块独立定义 | 独立性强 | 类型重复，可能不一致 |
 * | 类型包 | 专业管理 | 增加复杂度，过度设计 |
 * 
 * 本方案优势：
 * ===========
 * - **集中管理**：所有共享类型在一个文件中定义
 * - **类型安全**：使用 TypeScript 泛型和交叉类型确保类型正确
 * - **辅助函数**：提供 shim 创建函数，便于测试和默认值设置
 * 
 * 类型层次结构：
 * ============
 * DocumentShape（基础文档形状）
 *     ↓
 * CourseDoc / ChapterDoc / LessonDoc / ExerciseDoc / AssetDoc（各内容类型）
 */

/**
 * DocumentShape - 基础文档形状
 * 
 * 设计意图：
 * =========
 * 定义所有文档共有的基础字段，作为其他文档类型的基础。
 */
export type DocumentShape = {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

/**
 * CourseDoc - 课程文档类型
 * 
 * 设计意图：
 * =========
 * 在基础文档形状上增加课程特有的字段和关联数据。
 */
export type CourseDoc = DocumentShape & {
  cover?: string | null
  edition?: string | null
  body?: string | null
  chapters?: ChapterDoc[]
}

/**
 * ChapterDoc - 章节文档类型
 * 
 * 设计意图：
 * =========
 * 在基础文档形状上增加章节特有的字段和关联数据。
 */
export type ChapterDoc = DocumentShape & {
  course?: string | null
  courseId?: number | null
  cover?: string | null
  body?: string | null
  lessons?: LessonDoc[]
  exercises?: ExerciseDoc[]
  courseRef?: CourseDoc | null
}

/**
 * LessonDoc - 课时文档类型
 * 
 * 设计意图：
 * =========
 * 在基础文档形状上增加课时特有的字段和关联数据。
 */
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

/**
 * ExerciseDoc - 练习文档类型
 * 
 * 设计意图：
 * =========
 * 在基础文档形状上增加练习特有的字段和关联数据。
 */
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

/**
 * AssetDoc - 资源文档类型
 * 
 * 设计意图：
 * =========
 * 在基础文档形状上增加资源特有的字段。
 */
export type AssetDoc = DocumentShape & {
  type?: string
  url: string
  mime?: string | null
  size?: number | null
  meta?: string | null
}

/**
 * ContentTypes - 内容类型常量
 * 
 * 设计意图：
 * =========
 * 定义所有内容类型的常量值，避免硬编码字符串。
 * 
 * 使用方式：
 * ========
 * if (type === ContentTypes.LESSON) { ... }
 * if (nodeType === ContentTypes.AST_NODE.HEADING) { ... }
 */
export const ContentTypes = {
  LESSON: 'lesson',
  CHAPTER: 'chapter',
  COURSE: 'course',
  EXERCISE: 'exercise',
  ASSET: 'asset',

  /** AST 节点类型 */
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

/** ContentType - 内容类型联合类型 */
export type ContentType = typeof ContentTypes[keyof Omit<typeof ContentTypes, 'AST_NODE'>]

/** AstNodeType - AST 节点类型联合类型 */
export type AstNodeType = typeof ContentTypes.AST_NODE[keyof typeof ContentTypes.AST_NODE]

/**
 * createLessonShim - 创建课时文档 shim
 * 
 * 设计意图：
 * =========
 * 提供课时文档的默认值，便于测试和初始化。
 * 
 * 使用场景：
 * ========
 * - 单元测试中创建 mock 数据
 * - 表单初始化时设置默认值
 * - 数据转换时填充缺失字段
 * 
 * @param overrides 覆盖默认值的字段
 * @returns LessonDoc 课时文档
 */
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

/**
 * createChapterShim - 创建章节文档 shim
 * 
 * 设计意图：
 * =========
 * 提供章节文档的默认值，便于测试和初始化。
 * 
 * 使用场景：
 * ========
 * - 单元测试中创建 mock 数据
 * - 表单初始化时设置默认值
 * - 数据转换时填充缺失字段
 * 
 * @param overrides 覆盖默认值的字段
 * @returns ChapterDoc 章节文档
 */
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

/**
 * createCourseShim - 创建课程文档 shim
 * 
 * 设计意图：
 * =========
 * 提供课程文档的默认值，便于测试和初始化。
 * 
 * 使用场景：
 * ========
 * - 单元测试中创建 mock 数据
 * - 表单初始化时设置默认值
 * - 数据转换时填充缺失字段
 * 
 * @param overrides 覆盖默认值的字段
 * @returns CourseDoc 课程文档
 */
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

/** 默认导出 ContentTypes */
export default ContentTypes
