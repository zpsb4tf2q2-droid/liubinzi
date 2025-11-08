"use client"

import { signOut } from 'next-auth/react'
import { AUTH_PAGES } from '@/lib/constants'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: AUTH_PAGES.SIGN_IN })}
      className="inline-block rounded border px-4 py-2 hover:bg-gray-50"
    >
      Sign out
    </button>
  )
}
