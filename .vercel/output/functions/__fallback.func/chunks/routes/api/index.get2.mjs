import { d as defineEventHandler, q as queryCollection } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';

const index_get = defineEventHandler(async (event) => {
  const q = queryCollection(event, "course").order("order", "ASC").where("slug", "=", "pep-7a").first();
  return await q;
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
