export async function loadAsset(slug, opts = {}) {
  const { source, adapter } = opts
  const adapterRef = source?.adapter || adapter
  if (!adapterRef) return null
  const doc = await adapterRef.findOne('asset', { slug })
  return doc ? { asset: doc, __loadedBy: 'content-loader/asset' } : null
}

export async function listAssets(opts = {}) {
  const { source, adapter } = opts
  const adapterRef = source?.adapter || adapter
  if (!adapterRef) return []
  return adapterRef.findAll('asset', opts || {})
}

export default { loadAsset, listAssets }
