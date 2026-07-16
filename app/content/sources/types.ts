/**
 * ContentSource 接口定义了内容数据源的统一抽象层。
 * 
 * 设计意图：
 * =========
 * 使用策略模式（Strategy Pattern）+ 依赖倒置原则（DIP），将内容获取逻辑与具体数据源解耦。
 * 上层业务代码（Pages、Composables、Content Engine Facade）只依赖此接口，不关心数据来自文件还是数据库。
 * 
 * 为什么这样设计？
 * ===============
 * 1. **解决开发与生产环境的数据来源差异**：
 *    - 开发阶段：使用本地 Markdown 文件，方便 Typora/Obsidian 编写
 *    - 生产阶段：使用 PostgreSQL 数据库，支持在线编辑和性能优化
 * 
 * 2. **避免条件分支污染上层代码**：
 *    禁止出现 `if (isMarkdown) { ... } else { ... }` 这类判断，上层代码完全不感知数据源变化。
 * 
 * 3. **扩展性**：未来可以轻松添加新数据源（如 Remote CMS、API 等），只需实现此接口。
 * 
 * 替代方案对比：
 * =============
 * | 方案 | 优点 | 缺点 |
 * |------|------|------|
 * | 条件分支判断 | 实现简单 | 上层代码污染，每新增数据源需修改所有调用处 |
 * | 继承基类 | 面向对象 | 耦合度高，难以处理多数据源切换 |
 * | **接口抽象** | 解耦彻底，符合开闭原则 | 需要额外定义接口和实现类 |
 * 
 * 本方案优势：
 * ===========
 * - **开闭原则**：新增数据源只需实现接口，无需修改现有代码
 * - **依赖倒置**：上层依赖抽象而非具体实现
 * - **单一职责**：每种数据源实现只负责自己的数据读取逻辑
 * - **可测试性**：可轻松 Mock 数据源进行单元测试
 */
import type { Course, Chapter, Lesson, Exercise } from '../models/index'
import type { LessonPage, ChapterPage, CoursePage } from '../dto/index'

/**
 * ContentSource 接口 - 所有数据源必须实现的统一契约
 * 
 * 方法分类：
 * --------
 * 1. 基础查询（getXxx）：获取单个实体
 * 2. 列表查询（listXxx）：获取实体列表
 * 3. 页面聚合（getXxxPage）：获取页面级别的组合数据（包含关联关系）
 * 4. 默认值（getDefaultCourse）：获取默认课程
 */
export interface ContentSource {
  /**
   * 根据 slug 获取单个课程
   * @param slug 课程的唯一标识（URL 友好的字符串）
   * @returns Promise<Course | null> 课程对象或 null（未找到）
   */
  getCourse(slug: string): Promise<Course | null>

  /**
   * 根据 slug 获取单个章节
   * @param slug 章节的唯一标识
   * @returns Promise<Chapter | null> 章节对象或 null
   */
  getChapter(slug: string): Promise<Chapter | null>

  /**
   * 根据 slug 获取单个课时
   * @param slug 课时的唯一标识
   * @returns Promise<Lesson | null> 课时对象或 null
   */
  getLesson(slug: string): Promise<Lesson | null>

  /**
   * 根据 slug 获取单个练习
   * @param slug 练习的唯一标识
   * @returns Promise<Exercise | null> 练习对象或 null
   */
  getExercise(slug: string): Promise<Exercise | null>

  /**
   * 获取所有课程列表
   * @returns Promise<Course[]> 课程数组
   */
  listCourses(): Promise<Course[]>

  /**
   * 获取章节列表，可选按课程筛选
   * @param courseSlug 可选的课程 slug，用于筛选特定课程下的章节
   * @returns Promise<Chapter[]> 章节数组
   */
  listChapters(courseSlug?: string): Promise<Chapter[]>

  /**
   * 获取课时列表，可选按章节筛选
   * @param chapterSlug 可选的章节 slug，用于筛选特定章节下的课时
   * @returns Promise<Lesson[]> 课时数组
   */
  listLessons(chapterSlug?: string): Promise<Lesson[]>

  /**
   * 获取课时页面的完整数据（包含关联信息）
   * 
   * 页面数据包含：课时本身 + 所属章节 + 所属课程 + 上一课时 + 下一课时
   * @param slug 课时的唯一标识
   * @returns Promise<LessonPage | null> 课时页面数据或 null
   */
  getLessonPage(slug: string): Promise<LessonPage | null>

  /**
   * 获取章节页面的完整数据（包含关联信息）
   * 
   * 页面数据包含：章节本身 + 所属课程 + 课时列表 + 练习 + 上一章节 + 下一章节
   * @param slug 章节的唯一标识
   * @returns Promise<ChapterPage | null> 章节页面数据或 null
   */
  getChapterPage(slug: string): Promise<ChapterPage | null>

  /**
   * 获取课程页面的完整数据（包含关联信息）
   * 
   * 页面数据包含：课程本身 + 章节树（含课时）
   * @param slug 课程的唯一标识
   * @returns Promise<CoursePage | null> 课程页面数据或 null
   */
  getCoursePage(slug: string): Promise<CoursePage | null>

  /**
   * 获取默认课程的页面数据
   * 
   * 用于首页或课程中心展示默认课程，无需传入 slug
   * @returns Promise<CoursePage | null> 默认课程页面数据或 null
   */
  getDefaultCourse(): Promise<CoursePage | null>
}

/**
 * 数据源类型枚举
 * 
 * 用于根据环境变量选择对应的数据源实现：
 * - 'file': 开发环境，读取本地 Markdown 文件
 * - 'database': 生产环境，读取 PostgreSQL 数据库
 * 
 * 扩展说明：
 * --------
 * 未来如需支持新数据源（如 Remote CMS），只需：
 * 1. 在 SourceType 中添加新类型
 * 2. 实现 ContentSource 接口
 * 3. 在 engine.ts 的 createSource() 中添加分支判断
 */
export type SourceType = 'file' | 'database'
