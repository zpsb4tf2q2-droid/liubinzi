"use client"

import { useEffect, useState } from 'react'
import { getComments } from '@/lib/actions/comments'
import CommentItem from './CommentItem'
import type { CommentWithUser } from '@/lib/types'

interface CommentsListProps {
  postId: string
  initialComments: CommentWithUser[]
  currentUserId?: string | null
  postAuthorId?: string
}

export default function CommentsList({
  postId,
  initialComments,
  currentUserId,
  postAuthorId
}: CommentsListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments)
  const [isLoading, setIsLoading] = useState(false)

  const refreshComments = async () => {
    setIsLoading(true)
    const updatedComments = await getComments(postId)
    setComments(updatedComments)
    setIsLoading(false)
  }

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
          postAuthorId={postAuthorId}
          onDeleted={refreshComments}
        />
      ))}
    </div>
  )
}
