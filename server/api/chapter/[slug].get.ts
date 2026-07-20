import { chapterService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('Chapter', slug => chapterService.getChapterPage(slug))
