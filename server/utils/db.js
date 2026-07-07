import { getDb, createDb, closeDb, schema, db } from '../../drizzle/db.js'
import * as tables from '../../drizzle/schema.js'

export function useDb() {
  return getDb()
}

export { db, getDb, createDb, closeDb, schema, tables }

export default { useDb, db, getDb, createDb, closeDb, schema, tables }
