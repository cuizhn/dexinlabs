import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseService } from './CourseService'

// Mock repository 模块
vi.mock('@content/repositories', () => ({
  courseRepository: {
    listAllWithTopics: vi.fn(),
    getWithTopicsAndLessons: vi.fn()
  }
}))

import { courseRepository } from '@content/repositories'

const mockRepo = vi.mocked(courseRepository)

describe('CourseService', () => {
  let service: CourseService

  beforeEach(() => {
    service = new CourseService()
    vi.clearAllMocks()
  })

  describe('listAllWithTopics', () => {
    it('返回组装后的 CoursePage 列表', async () => {
      mockRepo.listAllWithTopics.mockResolvedValue([
        {
          id: 1, slug: 'math', title: '数学', description: '描述', order: 0,
          topics: [
            { id: 10, slug: 'algebra', title: '代数', summary: null, order: 0, courseId: 1 }
          ]
        }
      ])

      const result = await service.listAllWithTopics()

      expect(result).toHaveLength(1)
      expect(result[0]!.course.slug).toBe('math')
      expect(result[0]!.topics).toHaveLength(1)
      expect(result[0]!.topics[0]!.slug).toBe('algebra')
      // 确认内部字段被过滤
      expect(result[0]!.topics[0]).not.toHaveProperty('courseEntity')
    })

    it('空列表返回空数组', async () => {
      mockRepo.listAllWithTopics.mockResolvedValue([])
      const result = await service.listAllWithTopics()
      expect(result).toEqual([])
    })
  })

  describe('getCoursePage', () => {
    it('slug 为空时返回 null', async () => {
      expect(await service.getCoursePage('')).toBeNull()
      expect(await service.getCoursePage(null as unknown as string)).toBeNull()
    })

    it('仓储返回 null 时返回 null', async () => {
      mockRepo.getWithTopicsAndLessons.mockResolvedValue(null)
      expect(await service.getCoursePage('unknown')).toBeNull()
    })

    it('组装完整的 CoursePage 数据', async () => {
      mockRepo.getWithTopicsAndLessons.mockResolvedValue({
        id: 1, slug: 'math', title: '数学', description: null, order: 0,
        topics: [
          {
            id: 10, slug: 'algebra', title: '代数', summary: null, order: 0,
            courseId: 1,
            lessons: [
              { id: 100, slug: 'lesson-1', title: '第一课', summary: null, order: 0, topicId: 10, chapterId: null }
            ]
          }
        ]
      })

      const page = await service.getCoursePage('math')

      expect(page).not.toBeNull()
      expect(page!.course.slug).toBe('math')
      expect(page!.topics).toHaveLength(1)
      expect(page!.topics[0]!.lessons).toHaveLength(1)
      expect(page!.topics[0]!.lessons[0]!.slug).toBe('lesson-1')
    })
  })
})
