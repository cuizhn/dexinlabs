// ============================================================
// 【文件定位】content.config.ts
//  作用：@nuxt/content v3 的内容配置文件（Content Module 配置）
//  读取时机：Nuxt 启动时由 @nuxt/content 模块自动读取（类似 nuxt.config.ts）
//  配置目标：定义内容集合（Collections）的类型、数据源路径、Zod Schema 校验规则
//  与 nuxt.config.ts 的关系：本文件专门配置 Content 相关的 collections，
//    nuxt.config.ts 中仅需配置 content: { ... } 顶层对象即可
// ============================================================

// content.config.ts — 文件名标识

// ============================================================
// 【@nuxt/content 依赖导入】
//   defineContentConfig：类型安全的配置包装函数，返回 Config 对象给模块读取
//   defineCollection：定义单个内容集合（Collection），参数：{ type, source, schema }
//   z：Zod 校验库（由 @nuxt/content 导出），用于定义 Schema 并在运行时校验前端 matter / YAML
// ============================================================
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// ============================================================
// 【集合定义 chapter】章节元数据集合
//  集合类型：defineCollection 变量名 → 在 collections 导出时作为 key 使用（chapter）
// ----------
//  集合顶层字段说明：
//    type: 'data' | 'page' — @nuxt/content 两种集合类型之一
//      'data'：纯数据集合，内容不作为页面渲染路由（.yml 文件，不会生成路由）
//      'page'：页面内容集合，内容文件会自动注册为路由（.md 文件会生成页面）
//    source: 字符串 glob 模式 — 指定本集合数据源文件的路径（相对于项目 content/ 目录）
//      'chapter/**/*.yml'：content/chapter/ 下任意子目录的 .yml 文件都进入此集合
//    schema: Zod Object Schema — 运行时校验内容文件 Frontmatter / YAML 字段格式
//      不符合 schema 的文件会在控制台报错并跳过，避免脏数据进入应用
// ----------
//  Schema 子字段（z.object 内部）：
//    id: z.string()               — 章节唯一主键 ID，字符串类型（必填，无默认值）
//    slug: z.string()             — 章节 URL 友好标识，用于路由路径 /course/:chapter（必填）
//    title: z.string()            — 章节展示标题（必填）
//    description: z.string().optional() — 章节描述简介，.optional() 允许缺省（选填，默认 undefined）
//    course: z.string().optional() — 所属课程的 slug 标识，用于按课程筛选章节（选填，默认 undefined）
//    order: z.number().default(0) — 章节排序序号，数字类型，缺省时默认值为 0（靠前排）
//    lessons: z.array(z.string()).default([]) — 关联课时 slug 字符串数组，组织顺序（从先到后）
//                                   .default([]) 缺省时默认空数组，避免遍历时 undefined 报错
// ----------
//  数据组织关系：
//    Chapter（章节）→ 通过 lessons 字段（字符串数组）按顺序引用 Lesson（课时）的 slug
//    单向关系：只有 Chapter → Lesson，Lesson 文件中不维护所属章节（解耦，可复用课时到多章节）
//    Course（课程）→ 通过 Chapter.course 字段组织归属关系（多个 Chapter 可归属同一 Course）
// ============================================================
/**
 * 章节配置集合（Chapter Config）
 * type: data — 章节是核心组织单元，包含 id、slug、title、course、order、lessons 列表
 * 每个 Chapter 维护课时顺序、入口、练习入口；与 Lesson 是单向组织关系
 */
const chapter = defineCollection({
  // type: 'data' — 纯数据集合，YAML 文件不会生成 Nuxt 路由页面
  type: 'data',
  // source 源文件路径 glob：扫描 content/chapter/**/*.yml 所有 YAML 文件
  source: 'chapter/**/*.yml',
  // schema Zod 运行时校验：所有进入 chapter 集合的文件必须符合以下字段格式
  schema: z.object({
    // id: 字符串必填 — 章节唯一主键
    id: z.string(),
    // slug: 字符串必填 — URL 友好标识
    slug: z.string(),
    // title: 字符串必填 — 展示标题
    title: z.string(),
    // description: 字符串选填（optional() = 允许 undefined）
    description: z.string().optional(),
    // course: 字符串选填 — 所属课程的 slug 标识（如 'math-junior-high'）
    //   用于 GET /api/chapter?course=xxx 查询参数按课程筛选章节
    course: z.string().optional(),
    // order: 数字，默认值 0（缺省时 0）
    order: z.number().default(0),
    // lessons: 字符串数组（元素为课时 slug），默认值空数组 []
    lessons: z.array(z.string()).default([]),
  }),
})

// ============================================================
// 【集合定义 lesson】课时正文内容集合
// ----------
//  集合顶层字段说明：
//    type: 'page' — 页面类型集合，每个 .md 文件会被 @nuxt/content 自动注册为内容路由
//                    可通过 ContentRenderer 渲染，也支持 queryContent() 查询
//    source: 'lesson/**/*.md' — 扫描 content/lesson/ 下所有 .md Markdown 文件
//    schema: Zod Object Schema — 校验 Markdown Frontmatter 字段
// ----------
//  Schema 子字段（Markdown Frontmatter 对应）：
//    slug: z.string()        — 课时 URL 标识，在 /course/:chapter/:lesson 路由中使用（必填）
//    title: z.string()       — 课时正文标题（必填）
//    description: z.string() — 课时摘要描述，用于列表页展示（必填）
//    order: z.number().optional() — 课时排序序号（选填，undefined 时由 Chapter.lessons 数组顺序决定）
// ----------
//  归属关系说明：
//    Lesson 文件自身不包含 chapter 归属字段，由 Chapter 的 lessons 数组通过 slug 字符串组织
//    这样设计的好处：一个 Lesson 可被多个 Chapter 引用（跨章节复用），解耦内容与组织关系
// ============================================================
/**
 * 课程内容集合（Lesson Content）
 * type: page — 课时正文内容，slug 全局唯一，不维护归属关系
 * 由 Chapter.lessons 数组组织顺序
 */
const lesson = defineCollection({
  // type: 'page' — 页面类型集合，Markdown 文件可被 ContentRenderer 渲染为 HTML 页面
  type: 'page',
  // source 源文件路径 glob：扫描 content/lesson/**/*.md 所有 Markdown 文件
  source: 'lesson/**/*.md',
  // schema Zod 校验 Markdown Frontmatter（--- 包裹的 YAML 头部）
  schema: z.object({
    // slug: 字符串必填 — 课时唯一 URL 标识
    slug: z.string(),
    // title: 字符串必填 — 课时标题
    title: z.string(),
    // description:  字符串必填
    description: z.string(),
    // order:  数字选填 —  课时排序
    order: z.number().optional(),
  }),
})

// ============================================================
// 【集合定义 exercise】章节练习题集合
// ----------
//  集合顶层字段说明：
//    type: 'data' —  纯数据集合，YAML 文件不生成路由（通过 /exercise/[chapter] 页面查询渲染）
//    source: 'exercise/**/*.yml' —  扫描 content/exercise/ 下所有 YAML 文件
//    schema: Zod Object Schema —  校验练习文件字段
// ----------
//  Schema 子字段：
//    slug: z.string()                     —  与对应 Chapter.slug 相同，通过 slug 关联对应章节
//    title: z.string()                    —  练习标题（如"第一章练习"）
//    description: z.string().optional()   —   练习说明描述（选填）
//    questions: z.array(z.unknown()).default([]) —  题目数组，unknown 允许任意题目结构（选择题/填空题等），
//                                                   默认空数组，避免 undefined 遍历报错
// ----------
//  与 Chapter 的关联：
//    Exercise.slug === Chapter.slug —  一一对应，页面通过 Chapter.slug 直接查询 Exercise 集合
// ============================================================
/**
 * 练习集合（Exercise）
 * type: data — 每个 Chapter 对应一个 Exercise，slug 与 Chapter.slug 一致
 */
const exercise = defineCollection({
  // type: 'data' —  纯数据集合，不生成路由
  type: 'data',
  // source 源文件路径 glob：  content/exercise/**/*.yml
  source: 'exercise/**/*.yml',
  // schema Zod 校验  YAML 字段
  schema: z.object({
    // slug:  字符串必填  —  与 Chapter.slug 对应
    slug: z.string(),
    // title:  字符串必填  —  练习标题
    title: z.string(),
    // description:  字符串选填  —  练习说明
    description: z.string().optional(),
    // questions:  任意结构数组  —  题目列表，默认空数组
    questions: z.array(z.unknown()).default([]),
  }),
})

// ============================================================
// 【顶层导出 defineContentConfig】默认导出 Content 配置对象
//  顶层 key 说明：
//    collections: Record<string, CollectionDefinition> —  内容集合字典
//      key 名 =  集合名（在 queryCollection / Content 中使用）
//      value =  defineCollection 返回的集合定义
//    本项目注册 3 个集合：
//      chapter   →  章节元数据集合（data, YAML）
//      lesson    →  课时正文内容集合（page, Markdown）
//      exercise  →  练习题集合（data, YAML）
//
//  使用方式示例：
//    queryCollection('chapter') →  查询所有章节
//    queryCollection('lesson').where({ slug: 'xxx' }) →  查询指定课时
//    queryCollection('exercise').first() →  查询首个练习
// ============================================================
export default defineContentConfig({
  // collections：  所有已定义内容集合的命名空间字典
  collections: {
    // chapter 集合 →  对应上方 const chapter = defineCollection(...)
    chapter,
    // lesson 集合 →  对应上方 const lesson = defineCollection(...)
    lesson,
    // exercise 集合 →  对应上方 const exercise = defineCollection(...)
    exercise,
  },
})
