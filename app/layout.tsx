import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/ui/Toast'
import Navigation from '@/components/Navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Next.js + Supabase App',
  description: 'A modern web application built with Next.js and Supabase',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <ToastProvider>
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
            >
              Skip to main content
            </a>
            <div className="min-h-screen flex flex-col">
              <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                  <Navigation 
                    isAuthenticated={!!user}
                    userEmail={user?.email}
                  />
                </div>
              </header>
              <main id="main-content" className="flex-1">
                <div className="container mx-auto px-4 py-8">
                  {children}
                </div>
              </main>
              <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>&copy; {new Date().getFullYear()} App Name. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
