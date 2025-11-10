"use client"

import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui'
import CommentForm from './CommentForm'
import CommentsList from './CommentsList'
import type { CommentWithUser } from '@/lib/types'

interface CommentsSectionProps {
  postId: string
  comments: CommentWithUser[]
  currentUserId?: string | null
  postAuthorId?: string
  isAuthenticated: boolean
}

export default function CommentsSection({
  postId,
  comments,
  currentUserId,
  postAuthorId,
  isAuthenticated
}: CommentsSectionProps) {
  const [key, setKey] = useState(0)

  const handleCommentSuccess = () => {
    setKey(prev => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Comments ({comments.length})
        </h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {isAuthenticated ? (
            <div>
              <CommentForm
                postId={postId}
                onSuccess={handleCommentSuccess}
                placeholder="Write a comment..."
                submitLabel="Post Comment"
              />
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Please{' '}
                <a
                  href="/login"
                  className="font-medium underline hover:text-blue-900 dark:hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  log in
                </a>{' '}
                to comment on this post.
              </p>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <CommentsList
              key={key}
              postId={postId}
              initialComments={comments}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
