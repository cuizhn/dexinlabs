export function normalizeSlug(input: string | { slug: string } | null | undefined): string | null {
  const slug = typeof input === 'string' ? input : (input && typeof input === 'object' ? input.slug : '')
  const clean = String(slug || '').trim()
  return clean || null
}
