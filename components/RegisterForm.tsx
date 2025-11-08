"use client"

import { signIn } from 'next-auth/react'
import { FormEvent, useState } from 'react'
import { PASSWORD_MIN_LENGTH, AUTH_PAGES } from '@/lib/constants'

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

    if (password.length < PASSWORD_MIN_LENGTH) {
      setLoading(false)
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      return
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setLoading(false)
      
      if (data?.details && Array.isArray(data.details)) {
        const fieldErrors = data.details.map((err: any) => err.message).join(', ')
        setError(fieldErrors)
      } else {
        setError(data?.error || 'Failed to register')
      }
      return
    }

    // Auto sign-in after register
    const signInRes = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: AUTH_PAGES.DASHBOARD
    })
    setLoading(false)

    if (signInRes?.ok) {
      window.location.href = signInRes.url || AUTH_PAGES.DASHBOARD
    } else {
      window.location.href = AUTH_PAGES.SIGN_IN
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input id="name" name="name" type="text" className="w-full rounded border px-3 py-2" />
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required className="w-full rounded border px-3 py-2" />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required className="w-full rounded border px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="w-full rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
