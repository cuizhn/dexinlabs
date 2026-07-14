import fs from 'node:fs'
import path from 'node:path'
import type { ContentSource } from './types'
import type { Course, Chapter, Lesson, Exercise } from '../models/index'
import type { LessonPage, ChapterPage, CoursePage } from '../dto/index'

interface ParsedMarkdown {
  metadata: Record<string, unknown>
  content: string
}

function parseFrontmatter(raw: string): ParsedMarkdown {
  const metadata: Record<string, unknown> = {}
  let content = raw
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n/)
  if (frontmatterMatch && frontmatterMatch[1]) {
    content = raw.slice(frontmatterMatch[0].length)
    const frontmatter = frontmatterMatch[1]
    const lines = frontmatter.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split(':')
      if (!key) continue
      const value = rest.join(':').trim()
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractSlugFromPath(filePath: string): string {
  const base = path.basename(filePath, '.md')
  return slugify(base)
}

export class FileSource implements ContentSource {
  private contentDir: string

  constructor(contentDir?: string) {
    this.contentDir = contentDir || path.join(process.cwd(), 'content', 'courses')
  }

  async getCourse(slug: string): Promise<Course | null> {
    const courseDir = path.join(this.contentDir, slug)
    if (!fs.existsSync(courseDir) || !fs.statSync(courseDir).isDirectory()) {
      return null
    }
    const indexPath = path.join(courseDir, 'course.md')
    let metadata: Record<string, unknown> = {}
    let body = ''
    if (fs.existsSync(indexPath)) {
      const raw = fs.readFileSync(indexPath, 'utf-8')
      const parsed = parseFrontmatter(raw)
      metadata = parsed.metadata
      body = parsed.content
    }
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

  async getChapter(slug: string): Promise<Chapter | null> {
    const courseDirs = fs.existsSync(this.contentDir) ? fs.readdirSync(this.contentDir, { withFileTypes: true }) : []
    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue
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

  async getLesson(slug: string): Promise<Lesson | null> {
    const courseDirs = fs.existsSync(this.contentDir) ? fs.readdirSync(this.contentDir, { withFileTypes: true }) : []
    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue
      const chaptersDir = path.join(this.contentDir, courseDir.name, 'chapters')
      if (!fs.existsSync(chaptersDir) || !fs.statSync(chaptersDir).isDirectory()) continue
      const chapterDirs = fs.readdirSync(chaptersDir, { withFileTypes: true })
      for (const chapterDir of chapterDirs) {
        if (!chapterDir.isDirectory()) continue
        const lessonPath = path.join(chaptersDir, chapterDir.name, `${slug}.md`)
        if (!fs.existsSync(lessonPath)) continue
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

  async getExercise(slug: string): Promise<Exercise | null> {
    const courseDirs = fs.existsSync(this.contentDir) ? fs.readdirSync(this.contentDir, { withFileTypes: true }) : []
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
    return courses.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async listChapters(courseSlug?: string): Promise<Chapter[]> {
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

  async listLessons(chapterSlug?: string): Promise<Lesson[]> {
    if (!chapterSlug) return []
    const courseDirs = fs.existsSync(this.contentDir) ? fs.readdirSync(this.contentDir, { withFileTypes: true }) : []
    for (const courseDir of courseDirs) {
      if (!courseDir.isDirectory()) continue
      const chaptersDir = path.join(this.contentDir, courseDir.name, 'chapters')
      if (!fs.existsSync(chaptersDir) || !fs.statSync(chaptersDir).isDirectory()) continue
      const chapterDir = path.join(chaptersDir, chapterSlug)
      if (!fs.existsSync(chapterDir) || !fs.statSync(chapterDir).isDirectory()) continue
      const files = fs.readdirSync(chapterDir, { withFileTypes: true })
      const lessons: Lesson[] = []
      for (const file of files) {
        if (!file.isFile() || !file.name.endsWith('.md') || file.name === 'chapter.md') continue
        const slug = extractSlugFromPath(file.name)
        const lesson = await this.getLesson(slug)
        if (lesson) lessons.push(lesson)
      }
      return lessons.sort((a, b) => (a.order || 0) - (b.order || 0))
    }
    return []
  }

  async getLessonPage(slug: string): Promise<LessonPage | null> {
    const lesson = await this.getLesson(slug)
    if (!lesson) return null

    let chapter: Chapter | null = null
    let course: Course | null = null
    let previousLesson: Lesson | null = null
    let nextLesson: Lesson | null = null

    if (lesson.chapter) {
      chapter = await this.getChapter(lesson.chapter)
    }

    if (chapter && chapter.course) {
      course = await this.getCourse(chapter.course)
    }

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

  async getCoursePage(slug: string): Promise<CoursePage | null> {
    const course = await this.getCourse(slug)
    if (!course) return null
    return {
      course,
      chapters: course.chapters || []
    }
  }

  async getDefaultCourse(): Promise<CoursePage | null> {
    const courses = await this.listCourses()
    if (courses.length === 0) return null
    const firstCourse = courses[0]
    if (!firstCourse) return null
    return this.getCoursePage(firstCourse.slug)
  }
}