import { c as chapterRepository, l as lessonRepository } from './LessonRepository.mjs';
import { e as exerciseRepository } from './ExerciseRepository.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class ChapterService {
  constructor({
    chapters: chapters2 = chapterRepository,
    lessons: lessons2 = lessonRepository,
    exercises: exercises2 = exerciseRepository
  } = {}) {
    __publicField(this, "chapters");
    __publicField(this, "lessons");
    __publicField(this, "exercises");
    this.chapters = chapters2;
    this.lessons = lessons2;
    this.exercises = exercises2;
  }
  async list(courseSlug) {
    if (!courseSlug) return this.chapters.list();
    return this.chapters.listByCourse(courseSlug);
  }
  async getBySlug(slug) {
    const chapter = await this.chapters.getBySlug(slug);
    if (!chapter) return null;
    const lessons2 = await this.lessons.listByChapter(slug);
    const exercise = await this.exercises.getOneByChapter(slug);
    return {
      chapter,
      lessons: lessons2,
      exercise: exercise || null
    };
  }
}
const chapterService = new ChapterService();

export { chapterService as c };
//# sourceMappingURL=ChapterService.mjs.map
