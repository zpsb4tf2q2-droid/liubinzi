"use client"

import { useState, useTransition } from 'react'
import { useToast } from '@/components/ui/Toast'
import { togglePostLike } from '@/lib/actions/posts'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
  isAuthenticated: boolean
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  isAuthenticated
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  const router = useRouter()

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('error', 'Please log in to like posts')
      router.push('/login')
      return
    }

    const optimisticLiked = !liked
    const optimisticCount = liked ? likeCount - 1 : likeCount + 1

    setLiked(optimisticLiked)
    setLikeCount(optimisticCount)

    startTransition(async () => {
      const result = await togglePostLike(postId)

      if (result.success) {
        setLiked(result.liked)
        setLikeCount(result.liked ? optimisticCount : optimisticCount - 1)
      } else {
        setLiked(!optimisticLiked)
        setLikeCount(liked ? likeCount : likeCount - 1)
        showToast('error', result.error || 'Failed to update like')
      }
    })
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`
        inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${liked 
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
      aria-label={liked ? 'Unlike post' : 'Like post'}
      aria-pressed={liked}
    >
      <svg
        className={`w-5 h-5 transition-transform ${isPending ? 'scale-110' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-sm font-medium">
        {likeCount}
      </span>
    </button>
  )
}
