"use client"

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password')
      return
    }

    if (res?.ok) {
      window.location.href = res.url || callbackUrl
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required className="w-full rounded border px-3 py-2" />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required className="w-full rounded border px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <div className="pt-2 text-center text-sm text-gray-600">or</div>
      <button type="button" onClick={() => signIn('github', { callbackUrl })} className="w-full rounded border px-4 py-2 hover:bg-gray-50">
        Continue with GitHub
      </button>
    </form>
  )
}
