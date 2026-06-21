import { c as defineEventHandler, g as getRouterParam, e as createError, q as queryCollection } from '../../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';

const _chapter__get = defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const chapter = getRouterParam(event, "chapter");
  if (!slug || !chapter) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing slug or chapter parameter"
    });
  }
  try {
    const doc = await queryCollection(event, "chapters").path(`/courses/${slug}/${chapter}`).first();
    if (!doc) {
      throw createError({
        statusCode: 404,
        statusMessage: "Chapter not found"
      });
    }
    return {
      content: doc.body || "",
      // 章节正文内容（Markdown 渲染后的 HTML）
      title: doc.title || "",
      // 章节标题
      meta: doc.meta || {}
      // 章节元数据（如描述、关键词等）
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch chapter content"
    });
  }
});

export { _chapter__get as default };
//# sourceMappingURL=_chapter_.get.mjs.map
