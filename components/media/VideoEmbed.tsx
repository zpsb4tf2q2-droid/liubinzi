'use client'

import { useState, useRef } from 'react'

interface VideoEmbedProps {
  src: string
  title?: string
  className?: string
  onDelete?: () => void
  showControls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}

export default function VideoEmbed({
  src,
  title = 'Video',
  className = '',
  onDelete,
  showControls = true,
  autoplay = false,
  loop = false,
  muted = false
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(src)
  }

  const handleVideoError = () => {
    setError(true)
  }

  if (error) {
    return (
      <div className={`relative bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-500 mt-2">视频加载失败</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full"
          controls={showControls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          onError={handleVideoError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          您的浏览器不支持视频播放
        </video>

        {showControls && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopyUrl}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
              title="复制链接"
            >
              <svg
                className="h-4 w-4 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>

            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-red-100 transition-colors"
                title="删除"
              >
                <svg
                  className="h-4 w-4 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {title && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 font-medium">{title}</p>
        </div>
      )}
    </div>
  )
}
