'use client'

import { useState } from 'react'
import MediaUpload from '@/components/media/MediaUpload'
import MediaGallery from '@/components/media/MediaGallery'
import { MediaFile } from '@/lib/media/types'

export default function MediaPage() {
  const [uploadKey, setUploadKey] = useState(0)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleUploadComplete = (file: MediaFile) => {
    setNotification({
      type: 'success',
      message: `${file.name} 上传成功！`
    })
    setUploadKey(prev => prev + 1)
    
    setTimeout(() => setNotification(null), 3000)
  }

  const handleUploadError = (error: string) => {
    setNotification({
      type: 'error',
      message: error
    })
    
    setTimeout(() => setNotification(null), 5000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">媒体库</h1>
          <p className="mt-2 text-gray-600">管理您的图片、视频和其他媒体文件</p>
        </div>
      </div>

      {notification && (
        <div
          className={`rounded-lg p-4 ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">上传文件</h2>
        <MediaUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          multiple={true}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">媒体文件</h2>
        <MediaGallery key={uploadKey} />
      </div>
    </div>
  )
}
