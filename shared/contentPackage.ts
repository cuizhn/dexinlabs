/**
 * Content Package — 主仓库消费端类型定义
 *
 * 严格 mirror dexinlabs-content 仓库输出的 Contract：
 *
 *   protocol_version : 1              // 固定为 1
 *   ast_version      : 1              // 对应 shared/lessonAST.ts LessonContent.version
 *   manifest         : ContentManifest // 课程结构（不含 lessons）
 *   lessons          : PackageLesson[] // 49 个课时，严格 6 字段
 *   exercises        : unknown[]       // MVP 阶段为空数组 []，后续阶段独立处理
 *
 * 本文件是消费端只读镜像。改动必须与 dexinlabs-content 输出 Contract 同步。
 */
import type { LessonContent } from './lessonAST'

// ────────────────────────────────────────────
// Manifest（与 dexinlabs-content/content-manifest.json 严格同构）
// ────────────────────────────────────────────

export interface ManifestCourse {
  slug: string
  title: string
}

export interface ManifestTopic {
  slug: string
  title: string
  order: number
}

export interface ManifestChapter {
  slug: string
  title: string
  order: number
  topic_slug: string
}

export interface ContentManifest {
  courses: ManifestCourse[]
  topics: ManifestTopic[]
  chapters: ManifestChapter[]
}

// ────────────────────────────────────────────
// PackageLesson：严格 6 字段，不多不少
// ────────────────────────────────────────────

export interface PackageLesson {
  /** 课时 slug，组成 URL 的第二段 /courses/{topic_slug}/{lesson_slug} */
  slug: string
  /** 课时标题（对应 h1，Renderer 页面 header 使用） */
  title: string
  /** 所属 Topic slug（URL 一级路径） */
  topic_slug: string
  /** 所属 Chapter slug（教学组织归属，不暴露 URL） */
  chapter_slug: string
  /** 课时在 chapter 内的排序（正整数，从 1 开始） */
  order: number
  /** Lesson AST 主体（对应 lesson.content JSONB 列） */
  content: LessonContent
}

// ────────────────────────────────────────────
// 顶层 Content Package（严格 5 字段）
// ────────────────────────────────────────────

export interface ContentPackage {
  protocol_version: 1
  ast_version: 1
  manifest: ContentManifest
  lessons: PackageLesson[]
  exercises: unknown[]
}

// ────────────────────────────────────────────
// 静态常量（与 Contract 冻结值对齐）
// ────────────────────────────────────────────

export const CURRENT_PROTOCOL_VERSION: ContentPackage['protocol_version'] = 1
export const CURRENT_AST_VERSION: ContentPackage['ast_version'] = 1
