import { defineEventHandler } from 'h3'
import { courseService } from '@modules/content/services/index.js'

export default defineEventHandler(async () => {
  return courseService.getDefault()
})
