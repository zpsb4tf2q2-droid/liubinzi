"use client"

import { FormEvent, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { signUp } from '@/lib/actions/auth'

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')

    if (!email) {
      setError('Please provide an email address')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const result = await signUp(email, password, name)
      if (!result.success) {
        setError(result.error || 'Failed to create account')
        setLoading(false)
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('NEXT_REDIRECT')) {
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        <Input
          label="Name"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          helperText="Optional"
        />
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          helperText="Must be at least 6 characters long"
        />
        <Button 
          type="submit" 
          disabled={loading}
          fullWidth
          aria-busy={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
