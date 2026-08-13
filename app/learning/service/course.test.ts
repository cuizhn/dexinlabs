import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseService } from './course'

// Mock repository 模块
vi.mock('../repository/course', () => ({
  courseRepository: {
    list: vi.fn(),
    findBySlug: vi.fn()
  },
  default: {
    list: vi.fn(),
    findBySlug: vi.fn()
  }
}))

vi.mock('../repository/topic', () => ({
  topicRepository: {
    list: vi.fn()
  },
  default: {
    list: vi.fn()
  }
}))

import { courseRepository } from '../repository/course'
import { topicRepository } from '../repository/topic'

const mockCourseRepo = vi.mocked(courseRepository)
const mockTopicRepo = vi.mocked(topicRepository)

describe('CourseService', () => {
  let service: CourseService

  beforeEach(() => {
    service = new CourseService()
    vi.clearAllMocks()
  })

  describe('listAllWithTopics', () => {
    it('返回组装后的 CoursePage 列表', async () => {
      mockCourseRepo.list.mockResolvedValue([
        { id: 1, slug: 'mathematics', title: '数学' }
      ])
      mockTopicRepo.list.mockResolvedValue([
        { id: 10, slug: 'functions', title: '函数', order: 1 }
      ])

      const result = await service.listAllWithTopics()

      expect(result).toHaveLength(1)
      expect(result[0]!.course.slug).toBe('mathematics')
      expect(result[0]!.topics).toHaveLength(1)
      expect(result[0]!.topics[0]!.slug).toBe('functions')
    })

    it('无课程时返回空数组', async () => {
      mockCourseRepo.list.mockResolvedValue([])
      mockTopicRepo.list.mockResolvedValue([])
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
      mockCourseRepo.findBySlug.mockResolvedValue(null)
      expect(await service.getCoursePage('unknown')).toBeNull()
    })

    it('组装完整的 CoursePage 数据', async () => {
      mockCourseRepo.findBySlug.mockResolvedValue(
        { id: 1, slug: 'mathematics', title: '数学' }
      )
      mockTopicRepo.list.mockResolvedValue([
        { id: 10, slug: 'functions', title: '函数', order: 1 }
      ])

      const page = await service.getCoursePage('mathematics')

      expect(page).not.toBeNull()
      expect(page!.course.slug).toBe('mathematics')
      expect(page!.topics).toHaveLength(1)
      expect(page!.topics[0]!.slug).toBe('functions')
    })
  })
})
