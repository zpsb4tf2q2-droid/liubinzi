import { MediaType, MediaUploadConfig, DEFAULT_UPLOAD_CONFIG } from './types'

export interface ValidationResult {
  valid: boolean
  error?: string
  mediaType?: MediaType
}

export function validateFile(
  file: File,
  config: MediaUploadConfig = DEFAULT_UPLOAD_CONFIG
): ValidationResult {
  if (file.size > config.maxFileSize) {
    const maxSizeMB = Math.round(config.maxFileSize / (1024 * 1024))
    return {
      valid: false,
      error: `文件大小超过限制（最大 ${maxSizeMB}MB）`
    }
  }

  if (config.allowedImageTypes.includes(file.type)) {
    return {
      valid: true,
      mediaType: 'image'
    }
  }

  if (config.allowedVideoTypes.includes(file.type)) {
    return {
      valid: true,
      mediaType: 'video'
    }
  }

  if (config.allowedDocumentTypes.includes(file.type)) {
    return {
      valid: true,
      mediaType: 'document'
    }
  }

  return {
    valid: false,
    error: '不支持的文件类型'
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}
