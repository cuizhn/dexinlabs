import { topicRepository, exerciseRepository } from '@content/repositories'
import { TopicService } from './TopicService'
import { ExerciseService } from './ExerciseService'

let _topicService: TopicService | null = null
let _exerciseService: ExerciseService | null = null

export function getTopicService(): TopicService {
  if (!_topicService) {
    _topicService = new TopicService()
  }
  return _topicService
}

export function getExerciseService(): ExerciseService {
  if (!_exerciseService) {
    _exerciseService = new ExerciseService(getTopicService())
  }
  return _exerciseService
}