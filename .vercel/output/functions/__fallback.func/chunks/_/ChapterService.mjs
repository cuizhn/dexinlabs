import { q as queries } from './index.mjs';
import { c as chapterRepository, l as lessonRepository } from './LessonRepository.mjs';
import { e as exerciseRepository } from './ExerciseRepository.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class ChapterService {
  constructor({
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository
  } = {}) {
    __publicField(this, "chapters");
    __publicField(this, "lessons");
    __publicField(this, "exercises");
    this.chapters = chapters;
    this.lessons = lessons;
    this.exercises = exercises;
  }
  async list(courseSlug) {
    const q = queries.normalizeListChapters(courseSlug || {});
    if (!courseSlug) return this.chapters.list();
    return this.chapters.listByCourse(q.courseSlug || courseSlug);
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const chapter = await this.chapters.getBySlug(q.slug);
    if (!chapter) return null;
    const lessons = await this.lessons.listByChapter(q.slug);
    const exercise = await this.exercises.getOneByChapter(q.slug);
    return {
      chapter,
      lessons,
      exercise: exercise || null
    };
  }
}
const chapterService = new ChapterService();

export { chapterService as c };
//# sourceMappingURL=ChapterService.mjs.map
