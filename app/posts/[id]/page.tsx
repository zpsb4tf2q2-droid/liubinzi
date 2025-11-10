import { notFound, redirect } from 'next/navigation'
import { Card, CardBody } from '@/components/ui'
import { getPost } from '@/lib/actions/posts'
import { getComments } from '@/lib/actions/comments'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import CommentsSection from '@/components/CommentsSection'
import LikeButton from '@/components/LikeButton'

export const dynamic = 'force-dynamic'

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = params

  const [post, comments, supabase] = await Promise.all([
    getPost(id),
    getComments(id),
    createServerSupabaseClient()
  ])

  if (!post) {
    notFound()
  }

  if (post.status !== 'published') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== post.author_id) {
      notFound()
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <Card>
        <CardBody>
          <article>
            <header className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-4">
                {post.status === 'draft' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Draft
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.created_at)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {post.title}
              </h1>
            </header>
            <div className="prose dark:prose-invert max-w-none mb-6 sm:mb-8">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {post.content}
              </div>
            </div>
            <footer className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <LikeButton
                postId={post.id}
                initialLiked={post.user_has_liked || false}
                initialCount={post.like_count || 0}
                isAuthenticated={isAuthenticated}
              />
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comment_count || 0} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
              </div>
            </footer>
          </article>
        </CardBody>
      </Card>

      <CommentsSection
        postId={post.id}
        comments={comments}
        currentUserId={user?.id}
        postAuthorId={post.author_id}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}
