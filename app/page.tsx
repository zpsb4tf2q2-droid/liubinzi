import Link from 'next/link'
import { Card, CardBody } from '@/components/ui'

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 sm:space-y-12">
      <div className="text-center space-y-4 px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
          Welcome
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A modern web application built with Next.js and Supabase
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card hover>
          <CardBody>
            <div className="flex flex-col h-full">
              <div className="mb-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Authentication</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                Secure user authentication powered by Supabase
              </p>
              <Link 
                href="/login" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Learn more 
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </CardBody>
        </Card>
        
        <Card hover>
          <CardBody>
            <div className="flex flex-col h-full">
              <div className="mb-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Posts</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                Browse and read published posts
              </p>
              <Link 
                href="/posts" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                View Posts
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </CardBody>
        </Card>
        
        <Card hover className="sm:col-span-2 lg:col-span-1">
          <CardBody>
            <div className="flex flex-col h-full">
              <div className="mb-2">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Get Started</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                Create an account to get started
              </p>
              <Link 
                href="/register" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Sign up
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
