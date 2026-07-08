import { getDb, createDb, closeDb, schema, db } from '../../drizzle/db'
import * as tables from '../../drizzle/schema'

export function useDb() {
  return getDb()
}

export { db, getDb, createDb, closeDb, schema, tables }

export default { useDb, db, getDb, createDb, closeDb, schema, tables }
