export type MediaType = 'image' | 'video' | 'document'

export interface MediaFile {
  id: string
  name: string
  type: MediaType
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
  userId?: string
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface MediaUploadConfig {
  maxFileSize: number
  allowedImageTypes: string[]
  allowedVideoTypes: string[]
  allowedDocumentTypes: string[]
}

export const DEFAULT_UPLOAD_CONFIG: MediaUploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  allowedDocumentTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}
