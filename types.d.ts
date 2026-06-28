declare global {
  interface CollectionQueryBuilder<T = Record<string, unknown>> {
    where(field: string, operator: string, value: unknown): this
    order(field: string, direction?: 'ASC' | 'DESC'): this
    sort(field: string, direction?: 'ASC' | 'DESC'): this
    limit(n: number): this
    skip(n: number): this
    first(): Promise<T | null>
    all(): Promise<T[]>
  }

  function queryCollection<T = Record<string, unknown>>(
    event: unknown,
    collection: string
  ): CollectionQueryBuilder<T>
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    content?: {
      experimental?: {
        sqliteConnector?: boolean
        watch?: {
          enabled?: boolean
          [key: string]: unknown
        }
        [key: string]: unknown
      }
      build?: {
        markdown?: {
          remarkPlugins?: Record<string, unknown>
          rehypePlugins?: Record<string, unknown>
          toc?: Record<string, unknown>
          anchorLinks?: boolean | Record<string, unknown>
          [key: string]: unknown
        }
        highlight?: Record<string, unknown>
        [key: string]: unknown
      }
      sources?: Record<string, unknown>
      documentDriven?: boolean | Record<string, unknown>
      navigation?: Record<string, unknown>
      search?: Record<string, unknown>
      api?: {
        baseURL?: string
        [key: string]: unknown
      }
      [key: string]: unknown
    }
  }
}

export {}
