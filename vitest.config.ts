import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@content': resolve(__dirname, 'app/content'),
      '@markdown': resolve(__dirname, 'app/markdown'),
      '@database': resolve(__dirname, 'app/database'),
      '@progress': resolve(__dirname, 'app/progress'),
      '@server': resolve(__dirname, 'server'),
      '~': resolve(__dirname, 'app'),
      '~~': resolve(__dirname)
    }
  },
  test: {
    include: ['app/**/*.test.ts'],
    environment: 'node'
  }
})
