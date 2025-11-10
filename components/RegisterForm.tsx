"use client"

import { FormEvent, useState } from 'react'

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') || '')
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    if (password.length < 6) {
      setLoading(false)
      setError('Password must be at least 6 characters')
      return
    }

    setTimeout(() => {
      setLoading(false)
      setError('Registration not yet implemented. Please configure Supabase.')
    }, 500)
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        This form is a placeholder. Implement Supabase authentication to enable registration functionality.
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <input 
            id="name" 
            name="name" 
            type="text" 
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
