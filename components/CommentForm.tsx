"use client"

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { createComment } from '@/lib/actions/comments'

interface CommentFormProps {
  postId: string
  parentId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  submitLabel?: string
  autoFocus?: boolean
}

export default function CommentForm({
  postId,
  parentId = null,
  onSuccess,
  onCancel,
  placeholder = "Write a comment...",
  submitLabel = "Post Comment",
  autoFocus = false
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      showToast('error', 'Comment cannot be empty')
      return
    }

    setIsSubmitting(true)

    const result = await createComment(postId, content, parentId)

    if (result.success) {
      showToast('success', parentId ? 'Reply posted successfully' : 'Comment posted successfully')
      setContent('')
      onSuccess?.()
    } else {
      showToast('error', result.error || 'Failed to post comment')
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor={`comment-${parentId || 'root'}`} className="sr-only">
          {placeholder}
        </label>
        <textarea
          id={`comment-${parentId || 'root'}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none"
          aria-label={placeholder}
        />
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Posting...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
