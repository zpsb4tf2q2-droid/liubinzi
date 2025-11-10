import Link from 'next/link'
import { Card, CardBody } from '@/components/ui'
import { getPosts } from '@/lib/actions/posts'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function PostsPage() {
  const posts = await getPosts(20)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Posts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Browse all published posts</p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No posts</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No published posts available at the moment.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/posts/${post.id}`}
              className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
              <Card hover>
                <CardBody>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDate(post.created_at)}</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>{post.like_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{post.comment_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
