import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'
import { logInfo } from '@/lib/logger'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    logInfo("Unauthenticated dashboard access attempt")
    redirect('/login')
  }

  logInfo("Dashboard accessed", { 
    userId: (session.user as any)?.id, 
    email: session.user?.email 
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-700">Welcome, {session.user?.name || session.user?.email}!</p>
      <SignOutButton />
    </div>
  )
}
