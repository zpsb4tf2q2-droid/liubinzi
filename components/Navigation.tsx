'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

interface NavigationProps {
  isAuthenticated: boolean
  userEmail?: string
}

export default function Navigation({ isAuthenticated, userEmail }: NavigationProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
      <Link 
        href="/" 
        className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
      >
        App Name
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link 
          href="/posts" 
          className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 ${
            isActive('/posts')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          Posts
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 ${
                isActive('/dashboard')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/analytics" 
              className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 ${
                isActive('/analytics')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Analytics
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-300 dark:border-gray-600">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={userEmail}>
                {userEmail}
              </span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2"
                >
                  Sign out
                </button>
              </form>
            </div>
          </>
        ) : (
          <Link 
            href="/login" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2"
          >
            Sign in
          </Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  )
}
