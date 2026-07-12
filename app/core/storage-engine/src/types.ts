export interface StorageUploadResponse {
  url: string
  name?: string
  [key: string]: unknown
}

export type UploadHandler = (files: File[]) => Promise<StorageUploadResponse[]>

export interface StorageUploader {
  upload(files: File[]): Promise<StorageUploadResponse[]>
}

export type {
  StorageUploadResponse as UploadResponse
}
