import { c as defineEventHandler, g as getQuery } from '../../_/nitro.mjs';
import { a as courses, g as getDb, n as normalizeSlug } from '../../_/utils.mjs';
import { r as renderToHTML } from '../../_/index.mjs';
import { asc, eq } from 'drizzle-orm';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'unified';
import 'remark-parse';
import 'remark-rehype';
import 'rehype-stringify';
import 'remark-gfm';
import 'remark-math';
import 'remark-frontmatter';
import 'remark-slug';
import 'rehype-katex';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class CourseRepository {
  constructor(db) {
    __publicField(this, "_explicitDb");
    __publicField(this, "table");
    this._explicitDb = db || null;
    this.table = courses;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  async list() {
    return this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id));
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
  async getDefault() {
    let row = await this.getBySlug("pep-9a");
    if (!row) {
      const rows = await this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id)).limit(1);
      row = rows[0] || null;
    }
    return row;
  }
  async getWithChaptersAndLessons(slug) {
    if (!slug) return null;
    const result = await this._getDb().query.courses.findFirst({
      where: eq(this.table.slug, slug),
      with: {
        chapters: {
          with: {
            lessons: true
          },
          orderBy: (chapters, { asc: asc2 }) => [asc2(chapters.order), asc2(chapters.id)]
        }
      }
    });
    return result;
  }
}
const courseRepository = new CourseRepository();

class CourseService {
  async list() {
    return courseRepository.list();
  }
  async getDefault() {
    const defaultCourse = await courseRepository.getDefault();
    if (!defaultCourse) return null;
    const course = await courseRepository.getWithChaptersAndLessons(defaultCourse.slug);
    if (!course) return null;
    return this.buildCoursePage(course);
  }
  async getBySlug(slug) {
    const clean = normalizeSlug(slug);
    if (!clean) return null;
    const course = await courseRepository.getWithChaptersAndLessons(clean);
    if (!course) return null;
    return this.buildCoursePage(course);
  }
  async getCoursePage(slug) {
    return this.getBySlug(slug);
  }
  async buildCoursePage(course) {
    const courseBodyHtml = course.body ? await renderToHTML(course.body) : "";
    const chapters = await Promise.all((course.chapters || []).map(async (ch) => {
      const chapterBodyHtml = ch.body ? await renderToHTML(ch.body) : "";
      const lessons = await Promise.all((ch.lessons || []).map(async (l) => ({
        ...l,
        body: l.body ? await renderToHTML(l.body) : "",
        intro: l.intro ? await renderToHTML(l.intro) : ""
      })));
      return { ...ch, body: chapterBodyHtml, lessons };
    }));
    return {
      course: { ...course, body: courseBodyHtml },
      chapters
    };
  }
}
const courseService = new CourseService();

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const slug = String(query.slug || "");
  if (slug) {
    const result = await courseService.getCoursePage(slug);
    if (result) return result;
  }
  return courseService.getDefault();
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
