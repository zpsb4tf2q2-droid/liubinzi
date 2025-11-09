"use client"

import { useEffect } from "react"
import { logError } from "@/lib/logger"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError("Application Error", error, { digest: error.digest })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Oops!</h1>
          <h2 className="text-xl font-semibold text-gray-700">Something went wrong</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">
            {process.env.NODE_ENV === "development" 
              ? error.message 
              : "We encountered an unexpected error. Please try again."}
          </p>
          {process.env.NODE_ENV === "development" && error.stack && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-red-700 hover:text-red-900">
                Stack trace
              </summary>
              <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-48">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
