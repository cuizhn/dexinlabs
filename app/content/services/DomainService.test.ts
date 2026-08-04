import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DomainService } from './DomainService'

// Mock repository 模块
vi.mock('@content/repositories', () => ({
  domainRepository: {
    listAllWithTopics: vi.fn(),
    getWithTopicsAndLessons: vi.fn()
  }
}))

import { domainRepository } from '@content/repositories'

const mockRepo = vi.mocked(domainRepository)

describe('DomainService', () => {
  let service: DomainService

  beforeEach(() => {
    service = new DomainService()
    vi.clearAllMocks()
  })

  describe('listAllWithTopics', () => {
    it('返回组装后的 DomainPage 列表', async () => {
      mockRepo.listAllWithTopics.mockResolvedValue([
        {
          id: 1, slug: 'math', title: '数学', description: '描述', order: 0,
          topics: [
            { id: 10, slug: 'algebra', title: '代数', summary: null, order: 0, domain: 'math', domainId: 1 }
          ]
        }
      ])

      const result = await service.listAllWithTopics()

      expect(result).toHaveLength(1)
      expect(result[0]!.domain.slug).toBe('math')
      expect(result[0]!.topics).toHaveLength(1)
      expect(result[0]!.topics[0]!.slug).toBe('algebra')
      // 确认内部字段被过滤
      expect(result[0]!.topics[0]).not.toHaveProperty('domainEntity')
    })

    it('空列表返回空数组', async () => {
      mockRepo.listAllWithTopics.mockResolvedValue([])
      const result = await service.listAllWithTopics()
      expect(result).toEqual([])
    })
  })

  describe('getDomainPage', () => {
    it('slug 为空时返回 null', async () => {
      expect(await service.getDomainPage('')).toBeNull()
      expect(await service.getDomainPage(null as unknown as string)).toBeNull()
    })

    it('仓储返回 null 时返回 null', async () => {
      mockRepo.getWithTopicsAndLessons.mockResolvedValue(null)
      expect(await service.getDomainPage('unknown')).toBeNull()
    })

    it('组装完整的 DomainPage 数据', async () => {
      mockRepo.getWithTopicsAndLessons.mockResolvedValue({
        id: 1, slug: 'math', title: '数学', description: null, order: 0,
        topics: [
          {
            id: 10, slug: 'algebra', title: '代数', summary: null, order: 0,
            domain: 'math', domainId: 1,
            lessons: [
              { id: 100, slug: 'lesson-1', title: '第一课', summary: null, order: 0, topic: 'algebra', topicId: 10 }
            ]
          }
        ]
      })

      const page = await service.getDomainPage('math')

      expect(page).not.toBeNull()
      expect(page!.domain.slug).toBe('math')
      expect(page!.topics).toHaveLength(1)
      expect(page!.topics[0]!.lessons).toHaveLength(1)
      expect(page!.topics[0]!.lessons[0]!.slug).toBe('lesson-1')
    })
  })
})
