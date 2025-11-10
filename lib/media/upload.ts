import { createClientSupabaseClient } from '../supabase/client'
import { MediaFile, MediaType } from './types'

export interface UploadResult {
  success: boolean
  file?: MediaFile
  error?: string
}

export async function uploadToStorage(
  file: File,
  mediaType: MediaType,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const supabase = createClientSupabaseClient()
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${mediaType}s/${fileName}`

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    const mediaFile: MediaFile = {
      id: data.path,
      name: file.name,
      type: mediaType,
      mimeType: file.type,
      size: file.size,
      url: urlData.publicUrl,
      uploadedAt: new Date()
    }

    if (onProgress) {
      onProgress(100)
    }

    return {
      success: true,
      file: mediaFile
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    }
  }
}

export async function deleteFromStorage(filePath: string): Promise<boolean> {
  try {
    const supabase = createClientSupabaseClient()
    
    const { error } = await supabase.storage
      .from('media')
      .remove([filePath])

    return !error
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

export async function listMediaFiles(
  mediaType?: MediaType,
  limit: number = 50
): Promise<MediaFile[]> {
  try {
    const supabase = createClientSupabaseClient()
    
    const path = mediaType ? `${mediaType}s/` : ''
    
    const { data, error } = await supabase.storage
      .from('media')
      .list(path, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('List error:', error)
      return []
    }

    const files: MediaFile[] = data.map(item => {
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(`${path}${item.name}`)

      return {
        id: item.id,
        name: item.name,
        type: mediaType || 'document',
        mimeType: item.metadata?.mimetype || '',
        size: item.metadata?.size || 0,
        url: urlData.publicUrl,
        uploadedAt: new Date(item.created_at)
      }
    })

    return files
  } catch (error) {
    console.error('List files error:', error)
    return []
  }
}
