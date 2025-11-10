'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { validateFile } from '@/lib/media/validation'
import { uploadToStorage } from '@/lib/media/upload'
import { MediaFile, UploadProgress } from '@/lib/media/types'

interface MediaUploadProps {
  onUploadComplete?: (file: MediaFile) => void
  onUploadError?: (error: string) => void
  accept?: string
  multiple?: boolean
}

export default function MediaUpload({
  onUploadComplete,
  onUploadError,
  accept = 'image/*,video/*',
  multiple = false
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      const validation = validateFile(file)

      if (!validation.valid) {
        onUploadError?.(validation.error || '文件验证失败')
        continue
      }

      const progressItem: UploadProgress = {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }

      setUploadProgress(prev => [...prev, progressItem])

      const result = await uploadToStorage(
        file,
        validation.mediaType!,
        (progress) => {
          setUploadProgress(prev =>
            prev.map(item =>
              item.fileName === file.name
                ? { ...item, progress }
                : item
            )
          )
        }
      )

      if (result.success && result.file) {
        setUploadProgress(prev =>
          prev.map(item =>
            item.fileName === file.name
              ? { ...item, status: 'success', progress: 100 }
              : item
          )
        )
        onUploadComplete?.(result.file)
        
        setTimeout(() => {
          setUploadProgress(prev =>
            prev.filter(item => item.fileName !== file.name)
          )
        }, 2000)
      } else {
        setUploadProgress(prev =>
          prev.map(item =>
            item.fileName === file.name
              ? { ...item, status: 'error', error: result.error }
              : item
          )
        )
        onUploadError?.(result.error || '上传失败')
      }
    }
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">点击上传</span> 或拖拽文件到此处
          </p>
          <p className="text-xs text-gray-500 mt-2">
            支持图片、视频文件，最大50MB
          </p>
        </div>
      </div>

      {uploadProgress.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadProgress.map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate flex-1">
                  {item.fileName}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {item.status === 'uploading' && `${item.progress}%`}
                  {item.status === 'success' && '✓ 完成'}
                  {item.status === 'error' && '✗ 失败'}
                </span>
              </div>
              
              {item.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              
              {item.status === 'error' && item.error && (
                <p className="text-xs text-red-600 mt-1">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
