import { getDb, createDb, closeDb, schema, db } from '@core/database'
import * as tables from '@core/database'

export function useDb() {
  return getDb()
}

export { db, getDb, createDb, closeDb, schema, tables }

export default { useDb, db, getDb, createDb, closeDb, schema, tables }
