/**
 * FileSource - ContentSource 接口的本地文件实现
 * 
 * 设计意图：
 * =========
 * 为开发环境提供基于本地 Markdown 文件的内容数据源，方便开发者使用 Typora/Obsidian 等工具编写课程内容。
 * 
 * 文件结构约定：
 * ============
 * content/
 * └── courses/
 *     └── {course-slug}/           # 课程目录（目录名即为 course slug）
 *         ├── course.md            # 课程元数据（frontmatter）+ 正文
 *         └── chapters/
 *             └── {chapter-slug}/  # 章节目录（目录名即为 chapter slug）
 *                 ├── chapter.md   # 章节元数据 + 正文
 *                 ├── lesson1.md   # 课时文件（文件名即为 lesson slug）
 *                 ├── lesson2.md
 *                 └── ...
 * 
 * 为什么这样设计文件结构？
 * =======================
 * 1. **slug 即路径**：目录名和文件名直接作为实体的 slug，无需额外配置
 * 2. **层次清晰**：课程 → 章节 → 课时的层级关系通过目录结构自然表达
 * 3. **工具友好**：Markdown 文件可以直接用任何编辑器打开和编辑
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | **目录结构** | 直观，工具友好，slug 即路径 | 查询时需要遍历目录 |
 * | 单文件索引 | 查询快 | 需要维护索引文件 |
 * | JSON 配置 | 结构化强 | 不如 Markdown 易编辑 |
 * 
 * 本方案优势：
 * ===========
 * - **开发体验好**：直接编辑 .md 文件，所见即所得
 * - **零配置**：无需额外配置文件，目录结构即配置
 * - **版本控制友好**：Markdown 文件适合 Git 版本控制
 */
import fs from 'node:fs'
import path from 'node:path'
import type { ContentSource } from './types'
import type { Course, Chapter, Lesson, Exercise } from '../models/index'
import type { LessonPage, ChapterPage, CoursePage } from '../dto/index'

/**
 * 解析后的 Markdown 数据结构
 * 
 * frontmatter 中的元数据会被解析为键值对，正文内容单独存储
 */
interface ParsedMarkdown {
  metadata: Record<string, unknown>
  content: string
}

/**
 * 解析 Markdown 文件的 frontmatter 部分
 * 
 * 实现原理：
 * ========
 * 使用正则表达式匹配 `---\n...\n---\n` 格式的 frontmatter 区域，
 * 然后按行解析键值对，支持字符串（带引号）、布尔值、数字等类型。
 * 
 * 为什么不用第三方库（如 gray-matter）？
 * ===================================
 * 1. **保持轻量**：避免引入额外依赖，减少打包体积
 * 2. **可控性**：自定义解析逻辑可以精确控制行为
 * 3. **开发环境专用**：只在开发环境使用，性能不是关键
 * 
 * 替代方案：
 * ========
 * - gray-matter：功能强大，支持 YAML/TOML/JSON
 * - remark-frontmatter：与 remark 生态集成
 * 
 * @param raw 原始 Markdown 文本
 * @returns 包含 metadata 和 content 的对象
 */
function parseFrontmatter(raw: string): ParsedMarkdown {
  // 初始化元数据对象
  const metadata: Record<string, unknown> = {}
  // 默认内容为原始文本（无 frontmatter 时直接返回）
  let content = raw

  // 正则匹配 frontmatter 区域：---\n + 任意内容 + \n---\n
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n/)
  
  if (frontmatterMatch && frontmatterMatch[1]) {
    // 提取正文部分（去除 frontmatter 区域）
    content = raw.slice(frontmatterMatch[0].length)
    const frontmatter = frontmatterMatch[1]
    const lines = frontmatter.split('\n')

    // 逐行解析 frontmatter
    for (const line of lines) {
      const trimmed = line.trim()
      // 跳过空行和注释行（以 # 开头）
      if (!trimmed || trimmed.startsWith('#')) continue

      // 按第一个冒号分割键值对
      const [key, ...rest] = trimmed.split(':')
      if (!key) continue

      // 值可能包含冒号，所以用 join 重新组合
      const value = rest.join(':').trim()

      // 类型转换：字符串（带引号）、布尔值、数字、普通字符串
      if (value.startsWith('"') && value.endsWith('"')) {
        metadata[key.trim()] = value.slice(1, -1)
      } else if (value === 'true' || value === 'false') {
        metadata[key.trim()] = value === 'true'
      } else if (!isNaN(Number(value))) {
        metadata[key.trim()] = Number(value)
      } else {
        metadata[key.trim()] = value
      }
    }
  }

  return { metadata, content }
}

/**
 * 将字符串转换为 slug 格式
 * 
 * 实现规则：
 * ========
 * 1. 转换为小写
 * 2. 用连字符替换非字母数字和非中文字符
 * 3. 去除首尾连字符
 * 
 * 为什么这样处理？
 * ==============
 * - 支持中文：保留中文字符，便于中文课程使用
 * - URL 友好：小写 + 连字符是标准的 URL slug 格式
 * - 唯一性：文件名经过 slugify 后可以作为唯一标识
 * 
 * @param name 原始文件名或标题
 * @returns 标准化的 slug
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 从文件路径中提取 slug
 * 
 * 实现：去除文件扩展名后进行 slugify
 * 
 * @param filePath 文件路径
 * @returns 提取的 slug
 */
function extractSlugFromPath(filePath: string): string {
  const base = path.basename(filePath, '.md')
  return slugify(base)
}

/**
 * FileSource 类 - ContentSource 接口的本地文件实现
 * 
 * 使用场景：
 * ========
 * - 开发环境（CONTENT_SOURCE=file）
 * - 快速原型开发
 * - 静态站点生成（SSG）
 * 
 * 注意：
 * =====
 * - 所有数据库 ID 字段返回 null（文件系统无 ID 概念）
 * - 同步读取文件（开发环境无需异步优化）
 */
export class FileSource implements ContentSource {
  /** 内容目录路径，默认为项目根目录下的 content/courses */
  private contentDir: string

  /**
   * 构造函数
   * @param contentDir 可选的内容目录路径，默认使用 process.cwd()/content/courses
   */
  constructor(contentDir?: string) {
    this.contentDir = contentDir || path.join(process.cwd(), 'content', 'courses')
  }

  /**
   * 根据 slug 获取课程
   * 
   * 实现逻辑：
   * ========
   * 1. 检查课程目录是否存在
   * 2. 读取 course.md 文件（如果存在）
   * 3. 解析 frontmatter 获取元数据
   * 4. 递归获取章节列表
   * 
   * 为什么返回的 id 为 null？
   * ========================
   * 文件系统没有自增 ID 概念，id 字段仅用于与 DatabaseSource 保持接口一致。
   * 
   * @param slug 课程的唯一标识（目录名）
   * @returns Promise<Course | null>
   */
  async getCourse(slug: string): Promise<Course | null> {
    const courseDir = path.join(this.contentDir, slug)
    
    // 检查课程目录是否存在且是目录
    if (!fs.existsSync(courseDir) || !fs.statSync(courseDir).isDirectory()) {
      return null
    }

    const indexPath = path.join(courseDir, 'course.md')
    let metadata: Record<string, unknown> = {}
    let body = ''

    // 如果 course.md 存在，读取并解析
    if (fs.existsSync(indexPath)) {
      const raw = fs.readFileSync(indexPath, 'utf-8')
      const parsed = parseFrontmatter(raw)
      metadata = parsed.metadata
      body = parsed.content
    }

    // 递归获取章节列表
    const chapters = await this.listChapters(slug)

    return {
      id: null,
      slug,
      title: String(metadata.title || slug),
      summary: String(metadata.summary || ''),
      cover: String(metadata.cover || ''),
      edition: String(metadata.edition || ''),
      body: body || null,
      order: Number(metadata.order || 0),
      chapters
    }
  }

  /**
   * 根据 slug 获取章节
   * 
   * 实现逻辑：
   * ========
   * 遍历所有课程目录，查找匹配的章节目录
   * 
   * 为什么需要遍历？
   * ==============
   * 文件系统中章节的唯一标识（slug）可能在多个课程中重复，
   * 需要遍历找到正确的章节。在数据库方案中，通过 courseId 直接关联。
   * 
   * @param slug 章节的唯一标识
   * @returns Promise<Chapter | null>
   */
  async getChapter(slug: string): Promise<Chapter | null> {
    // 获取所有课程目录
    const courseDirs = fs.existsSync(this.contentDir) 
      ? fs.readdirSync(this.contentDir, { withFileTypes: true }) 
      : []

    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue

      // 构建章节目录路径
      const chapterDir = path.join(this.contentDir, courseDir.name, 'chapters', slug)
      if (!fs.existsSync(chapterDir) || !fs.statSync(chapterDir).isDirectory()) continue

      const indexPath = path.join(chapterDir, 'chapter.md')
      let metadata: Record<string, unknown> = {}
      let body = ''

      if (fs.existsSync(indexPath)) {
        const raw = fs.readFileSync(indexPath, 'utf-8')
        const parsed = parseFrontmatter(raw)
        metadata = parsed.metadata
        body = parsed.content
      }

      // 获取该章节下的课时列表
      const lessons = await this.listLessons(slug)

      return {
        id: null,
        slug,
        title: String(metadata.title || slug),
        summary: String(metadata.summary || ''),
        cover: String(metadata.cover || ''),
        body: body || null,
        order: Number(metadata.order || 0),
        course: courseDir.name,
        courseId: null,
        lessons,
        exercises: []
      }
    }

    return null
  }

  /**
   * 根据 slug 获取课时
   * 
   * 实现逻辑：
   * ========
   * 双重遍历：课程目录 → 章节目录，查找匹配的课时文件
   * 
   * @param slug 课时的唯一标识（文件名）
   * @returns Promise<Lesson | null>
   */
  async getLesson(slug: string): Promise<Lesson | null> {
    const courseDirs = fs.existsSync(this.contentDir) 
      ? fs.readdirSync(this.contentDir, { withFileTypes: true }) 
      : []

    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue

      const chaptersDir = path.join(this.contentDir, courseDir.name, 'chapters')
      if (!fs.existsSync(chaptersDir) || !fs.statSync(chaptersDir).isDirectory()) continue

      const chapterDirs = fs.readdirSync(chaptersDir, { withFileTypes: true })
      for (const chapterDir of chapterDirs) {
        if (!chapterDir.isDirectory()) continue

        // 构建课时文件路径
        const lessonPath = path.join(chaptersDir, chapterDir.name, `${slug}.md`)
        if (!fs.existsSync(lessonPath)) continue

        // 读取并解析课时文件
        const raw = fs.readFileSync(lessonPath, 'utf-8')
        const parsed = parseFrontmatter(raw)
        const metadata = parsed.metadata

        return {
          id: null,
          slug,
          title: String(metadata.title || slug),
          summary: String(metadata.summary || ''),
          objectives: String(metadata.objectives || ''),
          intro: String(metadata.intro || ''),
          body: parsed.content || null,
          summaryText: String(metadata.summaryText || ''),
          notes: String(metadata.notes || ''),
          order: Number(metadata.order || 0),
          chapter: chapterDir.name,
          chapterId: null
        }
      }
    }

    return null
  }

  /**
   * 根据 slug 获取练习
   * 
   * 实现逻辑：与 getLesson 类似，但返回练习数据结构
   * 
   * @param slug 练习的唯一标识
   * @returns Promise<Exercise | null>
   */
  async getExercise(slug: string): Promise<Exercise | null> {
    const courseDirs = fs.existsSync(this.contentDir) 
      ? fs.readdirSync(this.contentDir, { withFileTypes: true }) 
      : []

    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue

      const chaptersDir = path.join(this.contentDir, courseDir.name, 'chapters')
      if (!fs.existsSync(chaptersDir) || !fs.statSync(chaptersDir).isDirectory()) continue

      const chapterDirs = fs.readdirSync(chaptersDir, { withFileTypes: true })
      for (const chapterDir of chapterDirs) {
        if (!chapterDir.isDirectory()) continue

        const exercisePath = path.join(chaptersDir, chapterDir.name, `${slug}.md`)
        if (!fs.existsSync(exercisePath)) continue

        const raw = fs.readFileSync(exercisePath, 'utf-8')
        const parsed = parseFrontmatter(raw)
        const metadata = parsed.metadata

        return {
          id: null,
          slug,
          title: String(metadata.title || slug),
          summary: String(metadata.summary || ''),
          description: String(metadata.description || ''),
          body: parsed.content || null,
          hint: String(metadata.hint || ''),
          answer: String(metadata.answer || ''),
          analysis: String(metadata.analysis || ''),
          order: Number(metadata.order || 0),
          chapter: chapterDir.name,
          chapterId: null
        }
      }
    }

    return null
  }

  /**
   * 获取所有课程列表
   * 
   * 实现逻辑：
   * ========
   * 1. 读取 content/courses 目录下所有子目录
   * 2. 对每个目录调用 getCourse 获取完整信息
   * 3. 按 order 字段排序
   * 
   * @returns Promise<Course[]>
   */
  async listCourses(): Promise<Course[]> {
    if (!fs.existsSync(this.contentDir) || !fs.statSync(this.contentDir).isDirectory()) {
      return []
    }

    const courseDirs = fs.readdirSync(this.contentDir, { withFileTypes: true })
    const courses: Course[] = []

    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue
      const course = await this.getCourse(courseDir.name)
      if (course) courses.push(course)
    }

    // 按 order 字段升序排序
    return courses.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * 获取章节列表
   * 
   * @param courseSlug 课程 slug，用于限定章节范围
   * @returns Promise<Chapter[]>
   */
  async listChapters(courseSlug?: string): Promise<Chapter[]> {
    // 如果没有指定课程，返回空数组
    if (!courseSlug) return []

    const courseDir = path.join(this.contentDir, courseSlug)
    if (!fs.existsSync(courseDir) || !fs.statSync(courseDir).isDirectory()) {
      return []
    }

    const chaptersDir = path.join(courseDir, 'chapters')
    if (!fs.existsSync(chaptersDir) || !fs.statSync(chaptersDir).isDirectory()) {
      return []
    }

    const chapterDirs = fs.readdirSync(chaptersDir, { withFileTypes: true })
    const chapters: Chapter[] = []

    for (const chapterDir of chapterDirs) {
      if (!chapterDir.isDirectory()) continue
      const chapter = await this.getChapter(chapterDir.name)
      if (chapter) chapters.push(chapter)
    }

    return chapters.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * 获取课时列表
   * 
   * 实现逻辑：
   * ========
   * 1. 遍历课程目录找到对应的章节目录
   * 2. 读取章节目录下所有 .md 文件（排除 chapter.md）
   * 3. 解析每个文件获取课时信息
   * 
   * @param chapterSlug 章节 slug，用于限定课时范围
   * @returns Promise<Lesson[]>
   */
  async listLessons(chapterSlug?: string): Promise<Lesson[]> {
    if (!chapterSlug) return []

    const courseDirs = fs.existsSync(this.contentDir) 
      ? fs.readdirSync(this.contentDir, { withFileTypes: true }) 
      : []

    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue

      const chaptersDir = path.join(this.contentDir, courseDir.name, 'chapters')
      if (!fs.existsSync(chaptersDir) || !fs.statSync(chaptersDir).isDirectory()) continue

      const chapterDir = path.join(chaptersDir, chapterSlug)
      if (!fs.existsSync(chapterDir) || !fs.statSync(chapterDir).isDirectory()) continue

      const files = fs.readdirSync(chapterDir, { withFileTypes: true })
      const lessons: Lesson[] = []

      for (const file of files) {
        // 跳过非文件、非 .md 文件和 chapter.md
        if (!file.isFile() || !file.name.endsWith('.md') || file.name === 'chapter.md') continue
        
        const slug = extractSlugFromPath(file.name)
        const lesson = await this.getLesson(slug)
        if (lesson) lessons.push(lesson)
      }

      return lessons.sort((a, b) => (a.order || 0) - (b.order || 0))
    }

    return []
  }

  /**
   * 获取课时页面的完整数据
   * 
   * 页面数据包含：
   * ============
   * - lesson: 当前课时
   * - chapter: 所属章节
   * - course: 所属课程
   * - previousLesson: 上一课时
   * - nextLesson: 下一课时
   * 
   * 实现逻辑：
   * ========
   * 1. 获取当前课时
   * 2. 根据课时的 chapter 字段获取章节
   * 3. 根据章节的 course 字段获取课程
   * 4. 获取章节下所有课时，计算上一/下一课时
   * 
   * @param slug 课时 slug
   * @returns Promise<LessonPage | null>
   */
  async getLessonPage(slug: string): Promise<LessonPage | null> {
    const lesson = await this.getLesson(slug)
    if (!lesson) return null

    let chapter: Chapter | null = null
    let course: Course | null = null
    let previousLesson: Lesson | null = null
    let nextLesson: Lesson | null = null

    // 根据课时的 chapter 字段获取章节
    if (lesson.chapter) {
      chapter = await this.getChapter(lesson.chapter)
    }

    // 根据章节的 course 字段获取课程
    if (chapter && chapter.course) {
      course = await this.getCourse(chapter.course)
    }

    // 计算上一/下一课时
    if (chapter) {
      const lessonsInChapter = await this.listLessons(chapter.slug)
      const currentIndex = lessonsInChapter.findIndex(l => l.slug === lesson.slug)

      if (currentIndex >= 0) {
        if (currentIndex > 0) {
          previousLesson = lessonsInChapter[currentIndex - 1] || null
        }
        if (currentIndex < lessonsInChapter.length - 1) {
          nextLesson = lessonsInChapter[currentIndex + 1] || null
        }
      }
    }

    return {
      lesson,
      chapter,
      course,
      previousLesson,
      nextLesson
    }
  }

  /**
   * 获取章节页面的完整数据
   * 
   * 页面数据包含：
   * ============
   * - chapter: 当前章节
   * - course: 所属课程
   * - lessons: 课时列表
   * - exercise: 练习（暂未实现，返回 null）
   * - previousChapter: 上一章节
   * - nextChapter: 下一章节
   * 
   * @param slug 章节 slug
   * @returns Promise<ChapterPage | null>
   */
  async getChapterPage(slug: string): Promise<ChapterPage | null> {
    const chapter = await this.getChapter(slug)
    if (!chapter) return null

    let course: Course | null = null
    let previousChapter: Chapter | null = null
    let nextChapter: Chapter | null = null

    if (chapter.course) {
      course = await this.getCourse(chapter.course)
    }

    const lessons = await this.listLessons(chapter.slug)
    const exercise = null

    // 计算上一/下一章节
    if (course) {
      const chaptersInCourse = await this.listChapters(course.slug)
      const currentIndex = chaptersInCourse.findIndex(c => c.slug === chapter.slug)

      if (currentIndex >= 0) {
        if (currentIndex > 0) {
          previousChapter = chaptersInCourse[currentIndex - 1] || null
        }
        if (currentIndex < chaptersInCourse.length - 1) {
          nextChapter = chaptersInCourse[currentIndex + 1] || null
        }
      }
    }

    return {
      chapter,
      course,
      lessons,
      exercise,
      previousChapter,
      nextChapter
    }
  }

  /**
   * 获取课程页面的完整数据
   * 
   * @param slug 课程 slug
   * @returns Promise<CoursePage | null>
   */
  async getCoursePage(slug: string): Promise<CoursePage | null> {
    const course = await this.getCourse(slug)
    if (!course) return null
    return {
      course,
      chapters: course.chapters || []
    }
  }

  /**
   * 获取默认课程
   * 
   * 实现逻辑：返回课程列表中的第一个课程（按 order 排序后）
   * 
   * @returns Promise<CoursePage | null>
   */
  async getDefaultCourse(): Promise<CoursePage | null> {
    const courses = await this.listCourses()
    if (courses.length === 0) return null
    const firstCourse = courses[0]
    if (!firstCourse) return null
    return this.getCoursePage(firstCourse.slug)
  }
}
