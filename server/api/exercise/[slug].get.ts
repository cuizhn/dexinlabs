import { exerciseService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('Exercise', slug => exerciseService.getBySlug(slug))
