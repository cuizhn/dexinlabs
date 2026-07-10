import { defineConfig } from 'drizzle-kit'

const DATABASE_URL: string | undefined = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('[drizzle.config] DATABASE_URL is required. Check your .env file.')
}

export default defineConfig({
  schema: './app/core/database/schema.ts',
  out: './app/core/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL
  },
  verbose: true,
  strict: true
})
