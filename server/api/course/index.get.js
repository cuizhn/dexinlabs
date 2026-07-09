import { defineEventHandler } from 'h3'
import { courseService } from '@ce'

export default defineEventHandler(async () => {
  return courseService.getDefault()
})
