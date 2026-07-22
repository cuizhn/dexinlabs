/**
 * 知识领域服务 - 封装领域相关的业务逻辑
 *
 * 提供领域查询、默认领域获取、领域页面数据组装等功能。
 */
import { domainRepository } from '@content/repositories'
import type { DomainPage } from '../models/index'
import { normalizeSlug, toDomain, toTopic, toLesson } from '../utils'

export class DomainService {
  async list() {
    return domainRepository.list()
  }

  /**
   * 获取所有领域及其主题列表（用于知识地图等场景）
   * 使用 toDomain/toTopic 显式选取字段，避免内部字段泄漏
   */
  async listAllWithTopics(): Promise<DomainPage[]> {
    const domainsWithTopics = await domainRepository.listAllWithTopics()
    return domainsWithTopics.map(d => ({
      domain: toDomain(d),
      topics: (d.topics || []).map(t => toTopic(t))
    }))
  }

  async getDefault(): Promise<DomainPage | null> {
    const defaultDomain = await domainRepository.getDefault()
    if (!defaultDomain) return null
    const domain = await domainRepository.getWithTopicsAndLessons(defaultDomain.slug)
    if (!domain) return null
    return this.buildDomainPage(domain)
  }

  async getBySlug(slug: string): Promise<DomainPage | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    const domain = await domainRepository.getWithTopicsAndLessons(clean)
    if (!domain) return null
    return this.buildDomainPage(domain)
  }

  async getDomainPage(slug: string): Promise<DomainPage | null> {
    return this.getBySlug(slug)
  }

  /**
   * 组装领域页面数据：使用 toDomain/toTopic/toLesson 显式选取字段，
   * 避免仓储层关联查询的内部字段泄漏到 API 响应
   */
  private buildDomainPage(domain: Record<string, unknown>): DomainPage {
    const rawTopics = (domain.topics as Record<string, unknown>[]) || []
    const topics = rawTopics.map(t => {
      const rawLessons = (t.lessons as Record<string, unknown>[]) || []
      return {
        ...toTopic(t),
        lessons: rawLessons.map(l => toLesson(l))
      }
    })

    return {
      domain: toDomain(domain),
      topics
    }
  }
}

export const domainService = new DomainService()
export default domainService
