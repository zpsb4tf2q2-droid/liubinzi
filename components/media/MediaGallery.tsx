'use client'

import { useState, useEffect } from 'react'
import { MediaFile } from '@/lib/media/types'
import { listMediaFiles, deleteFromStorage } from '@/lib/media/upload'
import { formatFileSize } from '@/lib/media/validation'
import ImagePreview from './ImagePreview'
import VideoEmbed from './VideoEmbed'

interface MediaGalleryProps {
  onSelectMedia?: (file: MediaFile) => void
  selectable?: boolean
}

export default function MediaGallery({
  onSelectMedia,
  selectable = false
}: MediaGalleryProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')

  useEffect(() => {
    loadMedia()
  }, [filter])

  const loadMedia = async () => {
    setLoading(true)
    const files = await listMediaFiles(filter === 'all' ? undefined : filter)
    setMediaFiles(files)
    setLoading(false)
  }

  const handleDelete = async (file: MediaFile) => {
    if (confirm('确定要删除这个文件吗？')) {
      const success = await deleteFromStorage(file.id)
      if (success) {
        setMediaFiles(prev => prev.filter(f => f.id !== file.id))
      }
    }
  }

  const handleSelect = (file: MediaFile) => {
    if (selectable && onSelectMedia) {
      onSelectMedia(file)
    }
  }

  const filteredFiles = mediaFiles

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('image')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          图片
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'video'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          视频
        </button>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500">暂无媒体文件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
                selectable ? 'cursor-pointer hover:border-blue-500' : ''
              }`}
              onClick={() => handleSelect(file)}
            >
              <div className="aspect-video relative">
                {file.type === 'image' ? (
                  <ImagePreview
                    src={file.url}
                    alt={file.name}
                    onDelete={() => handleDelete(file)}
                    className="w-full h-full"
                  />
                ) : file.type === 'video' ? (
                  <VideoEmbed
                    src={file.url}
                    title={file.name}
                    onDelete={() => handleDelete(file)}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
