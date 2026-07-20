import { l as lessons, g as getDb, c as chapters, n as normalizeSlug } from './utils.mjs';
import { r as renderToHTML } from './index.mjs';
import { asc, eq, or } from 'drizzle-orm';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class LessonRepository {
  constructor(db) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
    this._explicitDb = db || null;
    this.table = lessons;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  async list() {
    return this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id));
  }
  async listByChapter(chapterSlug) {
    if (!chapterSlug) return [];
    const rows = await this._getDb().select().from(this.table).leftJoin(chapters, eq(this.table.chapterId, chapters.id)).where(or(eq(this.table.chapter, chapterSlug), eq(chapters.slug, chapterSlug))).orderBy(asc(this.table.order), asc(this.table.id));
    return rows;
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async getWithChapterAndCourse(slug) {
    if (!slug) return null;
    const result = await this._getDb().query.lessons.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        chapterRef: {
          with: {
            courseRef: true,
            lessons: {
              orderBy: (lessons2, { asc: asc2 }) => [asc2(lessons2.order), asc2(lessons2.id)]
            }
          }
        }
      }
    });
    if (!result) return null;
    const chapterRef = result.chapterRef;
    return {
      ...result,
      chapterEntity: result.chapterRef || null,
      courseEntity: (chapterRef == null ? void 0 : chapterRef.courseRef) || null,
      siblingLessons: (chapterRef == null ? void 0 : chapterRef.lessons) || []
    };
  }
}
const lessonRepository = new LessonRepository();

class LessonService {
  async listByChapter(chapterSlug) {
    const clean = normalizeSlug(chapterSlug);
    if (!clean) return [];
    return lessonRepository.listByChapter(clean);
  }
  async listAll() {
    return lessonRepository.list();
  }
  async getBySlug(slug) {
    const clean = normalizeSlug(slug);
    if (!clean) return null;
    const data = await lessonRepository.getWithChapterAndCourse(clean);
    if (!data) return null;
    return { ...data, chapter: data.chapterEntity || null };
  }
  async getLessonPage(slug) {
    const clean = normalizeSlug(slug);
    if (!clean) return null;
    const data = await lessonRepository.getWithChapterAndCourse(clean);
    if (!data) return null;
    const currentIndex = data.siblingLessons.findIndex((l) => l.slug === data.slug);
    const previousLesson = currentIndex > 0 ? data.siblingLessons[currentIndex - 1] || null : null;
    const nextLesson = currentIndex >= 0 && currentIndex < data.siblingLessons.length - 1 ? data.siblingLessons[currentIndex + 1] || null : null;
    const bodyHtml = data.body ? await renderToHTML(data.body) : "";
    const introHtml = data.intro ? await renderToHTML(data.intro) : "";
    const summaryHtml = data.summaryText ? await renderToHTML(data.summaryText) : "";
    return {
      lesson: { ...data, body: bodyHtml, intro: introHtml, summaryText: summaryHtml },
      chapter: data.chapterEntity || null,
      course: data.courseEntity || null,
      previousLesson,
      nextLesson
    };
  }
}
const lessonService = new LessonService();

export { lessonService as l };
//# sourceMappingURL=LessonService.mjs.map
