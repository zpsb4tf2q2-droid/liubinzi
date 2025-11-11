"use client"

import { useState } from 'react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { deleteComment } from '@/lib/actions/comments'
import CommentForm from './CommentForm'
import type { CommentWithUser } from '@/lib/types'

interface CommentItemProps {
  comment: CommentWithUser
  postId: string
  currentUserId?: string | null
  postAuthorId?: string
  isReply?: boolean
  onDeleted?: () => void
}

export default function CommentItem({
  comment,
  postId,
  currentUserId,
  postAuthorId,
  isReply = false,
  onDeleted
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { showToast } = useToast()

  const canDelete = currentUserId && (comment.user_id === currentUserId || postAuthorId === currentUserId)
  const canReply = !isReply && currentUserId

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setIsDeleting(true)

    const result = await deleteComment(comment.id, postId)

    if (result.success) {
      showToast('success', 'Comment deleted successfully')
      onDeleted?.()
    } else {
      showToast('error', result.error || 'Failed to delete comment')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (isDeleting) {
    return null
  }

  return (
    <div className={`${isReply ? 'ml-8 sm:ml-12' : ''}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {comment.user?.email?.split('@')[0] || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 mt-1 ml-1">
            {canReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 
                         hover:text-blue-600 dark:hover:text-blue-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Reply to comment"
              >
                Reply
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 
                         hover:text-red-600 dark:hover:text-red-400
                         focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1
                         disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete comment"
              >
                Delete
              </button>
            )}
          </div>
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                placeholder="Write a reply..."
                submitLabel="Post Reply"
                autoFocus
                onSuccess={() => {
                  setIsReplying(false)
                }}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  postAuthorId={postAuthorId}
                  isReply
                  onDeleted={onDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
