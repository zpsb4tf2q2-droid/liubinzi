"use client"

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="inline-block rounded border px-4 py-2 hover:bg-gray-50"
    >
      Sign out
    </button>
  )
}
