import { lessonService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('Lesson', slug => lessonService.getLessonPage(slug))
