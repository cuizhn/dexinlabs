import type {
  StorageUploader,
  StorageUploadResponse,
  UploadHandler
} from './types'

export class FallbackStorageUploader implements StorageUploader {
  async upload(_files: File[]): Promise<StorageUploadResponse[]> {
    throw new Error(
      '[storage-engine] StorageUploader is not configured. ' +
      'Please register a real implementation (OBS/S3/COS/OSS) via storage-engine provider. ' +
      'Editor modules only depend on the StorageUploader abstraction — ' +
      'they must never know OBS/S3 details.'
    )
  }
}

export function createUploadHandler(uploader?: StorageUploader): UploadHandler {
  const impl = uploader ?? new FallbackStorageUploader()
  return async (files: File[]) => impl.upload(files)
}

export function toMarkdownImageLinks(responses: StorageUploadResponse[]): string {
  return responses
    .map(r => `![${r.name ?? 'image'}](${r.url})`)
    .join('\n')
}

export type {
  StorageUploader,
  StorageUploadResponse,
  UploadHandler
} from './types'

export type {
  StorageUploadResponse as UploadResponse
} from './types'
