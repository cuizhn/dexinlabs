import { d as defineEventHandler, b as getQuery, q as queryCollection } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const course = query.course;
  const q = queryCollection(event, "chapter").order("order", "ASC");
  if (course) {
    q.where("course", "=", course);
  }
  return await q.all();
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
