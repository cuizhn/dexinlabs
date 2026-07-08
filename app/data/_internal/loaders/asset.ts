import type { Asset, LoaderOptions } from '@core/contracts/Loader'

interface AssetAdapter {
  findOne(entity: string, query: { slug: string }): Promise<Asset | null>
  findAll(entity: string, opts: Record<string, unknown>): Promise<Asset[]>
}

interface AssetLoaderSource {
  adapter?: AssetAdapter
  [key: string]: unknown
}

interface AssetLoadOptions extends LoaderOptions {
  source?: AssetLoaderSource
  adapter?: AssetAdapter
}

interface LoadedAssetResult {
  asset: Asset
  __loadedBy: string
}

export async function loadAsset(
  slug: string,
  opts: AssetLoadOptions = {}
): Promise<LoadedAssetResult | null> {
  const { source, adapter } = opts
  const adapterRef: AssetAdapter | undefined = source?.adapter || adapter
  if (!adapterRef) return null
  const doc = await adapterRef.findOne('asset', { slug })
  return doc ? { asset: doc, __loadedBy: 'content-loader/asset' } : null
}

export async function listAssets(
  opts: AssetLoadOptions = {}
): Promise<Asset[]> {
  const { source, adapter } = opts
  const adapterRef: AssetAdapter | undefined = source?.adapter || adapter
  if (!adapterRef) return []
  return adapterRef.findAll('asset', opts || {})
}

export default { loadAsset, listAssets }
