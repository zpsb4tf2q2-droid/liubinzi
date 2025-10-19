import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next 14 + Tailwind Starter',
  description: 'A minimal Next.js 14 App Router scaffold with Tailwind CSS and a health check endpoint.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
