import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import '@/lib/env'

export const metadata: Metadata = {
  title: 'Auth.js + Prisma Demo',
  description: 'Credentials and GitHub OAuth with Prisma Adapter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
