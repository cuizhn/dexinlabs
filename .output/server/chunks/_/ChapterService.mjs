import { c as chapters, g as getDb, a as courses, n as normalizeSlug } from './utils.mjs';
import { r as renderToHTML } from './index.mjs';
import { asc, eq, or } from 'drizzle-orm';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class ChapterRepository {
  constructor(db) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
    this._explicitDb = db || null;
    this.table = chapters;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  async list() {
    return this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id));
  }
  async listByCourse(courseSlug) {
    if (!courseSlug) return [];
    const rows = await this._getDb().select().from(this.table).leftJoin(courses, eq(this.table.courseId, courses.id)).where(or(eq(this.table.course, courseSlug), eq(courses.slug, courseSlug))).orderBy(asc(this.table.order), asc(this.table.id));
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
  async getWithLessonsAndCourse(slug) {
    var _a;
    if (!slug) return null;
    const result = await this._getDb().query.chapters.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        courseRef: {
          with: {
            chapters: {
              orderBy: (chapters2, { asc: asc2 }) => [asc2(chapters2.order), asc2(chapters2.id)]
            }
          }
        },
        lessons: {
          orderBy: (lessons, { asc: asc2 }) => [asc2(lessons.order), asc2(lessons.id)]
        },
        exercises: {
          limit: 1
        }
      }
    });
    if (!result) return null;
    const courseRef = result.courseRef;
    return {
      ...result,
      courseEntity: result.courseRef || null,
      lessonList: result.lessons || [],
      exerciseEntity: ((_a = result.exercises) == null ? void 0 : _a[0]) || null,
      siblingChapters: (courseRef == null ? void 0 : courseRef.chapters) || []
    };
  }
}
const chapterRepository = new ChapterRepository();

class ChapterService {
  async list(courseSlug) {
    if (!courseSlug) return chapterRepository.list();
    const clean = normalizeSlug(courseSlug);
    if (!clean) return [];
    return chapterRepository.listByCourse(clean);
  }
  async getBySlug(slug) {
    return this.getChapterPage(slug);
  }
  async getChapterPage(slug) {
    const clean = normalizeSlug(slug);
    if (!clean) return null;
    const data = await chapterRepository.getWithLessonsAndCourse(clean);
    if (!data) return null;
    const currentIndex = data.siblingChapters.findIndex((c) => c.slug === data.slug);
    const previousChapter = currentIndex > 0 ? data.siblingChapters[currentIndex - 1] || null : null;
    const nextChapter = currentIndex >= 0 && currentIndex < data.siblingChapters.length - 1 ? data.siblingChapters[currentIndex + 1] || null : null;
    const bodyHtml = data.body ? await renderToHTML(data.body) : "";
    const lessonsWithHtml = await Promise.all((data.lessonList || []).map(async (l) => ({
      ...l,
      body: l.body ? await renderToHTML(l.body) : "",
      intro: l.intro ? await renderToHTML(l.intro) : ""
    })));
    return {
      chapter: { ...data, body: bodyHtml },
      course: data.courseEntity || null,
      lessons: lessonsWithHtml,
      exercise: data.exerciseEntity || null,
      previousChapter,
      nextChapter
    };
  }
}
const chapterService = new ChapterService();

export { chapterService as c };
//# sourceMappingURL=ChapterService.mjs.map
