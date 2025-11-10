import Link from 'next/link'
import { Card, CardBody } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Post Not Found
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sorry, we couldn&apos;t find the post you&apos;re looking for.
            </p>
            <div className="mt-6">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Posts
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
