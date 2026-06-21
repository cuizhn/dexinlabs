// composables/useChapter.js

import { chapterRepository } from '~/repositories/chapterRepository'

export function useChapter() {

  /**
   * 获取章节内容
   */
  async function getChapter(courseSlug, chapterSlug) {

    const chapter =
      await chapterRepository.findBySlug(
        courseSlug,
        chapterSlug
      )

    return chapter
  }

  /**
   * 获取章节导航
   */
  async function getNavigation(courseSlug, chapterSlug) {

    const navigation =
      await chapterRepository.getNavigation(
        courseSlug,
        chapterSlug
      )

    return navigation
  }

  /**
   * 页面级组合：章节 + 导航
   */
  async function loadChapter(courseSlug, chapterSlug) {

    const chapter =
      await getChapter(courseSlug, chapterSlug)

    if (!chapter) {
      return {
        chapter: null,
        navigation: {
          prev: null,
          next: null
        }
      }
    }

    const navigation =
      await getNavigation(courseSlug, chapterSlug)

    return {
      chapter,
      navigation
    }
  }

  return {
    getChapter,
    getNavigation,
    loadChapter
  }
}