import { defineEventHandler } from 'h3'
import { courseService } from '@data/services/index'

export default defineEventHandler(async () => {
  return courseService.getDefault()
})
