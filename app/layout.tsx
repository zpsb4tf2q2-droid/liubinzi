import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next.js + Supabase App',
  description: 'A modern web application built with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <div className="text-xl font-bold text-gray-900">
                  App Name
                </div>
                <div className="flex items-center gap-4">
                  {/* Navigation items will go here */}
                </div>
              </nav>
            </div>
          </header>
          <div className="flex flex-1">
            {/* Sidebar placeholder - can be conditionally rendered */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-200">
              <div className="p-4">
                <div className="space-y-2">
                  {/* Sidebar navigation items will go here */}
                </div>
              </div>
            </aside>
            <main className="flex-1">
              <div className="container mx-auto px-4 py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
