import Link from 'next/link'

export default function Home() {
  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="text-gray-600">Demo of Auth.js with Prisma Adapter.</p>
      <div className="flex justify-center gap-3">
        <Link href="/login" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Login</Link>
        <Link href="/register" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50">Register</Link>
        <Link href="/dashboard" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Dashboard</Link>
      </div>
    </div>
  )
}
