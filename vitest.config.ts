import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@database': resolve(__dirname, 'app/database'),
      '@server': resolve(__dirname, 'server'),
      '@shared': resolve(__dirname, 'shared'),
      '@content': resolve(__dirname, 'app/content'),
      '~': resolve(__dirname, 'app'),
      '~~': resolve(__dirname)
    }
  },
  test: {
    include: ['app/**/*.test.ts'],
    environment: 'node'
  }
})
