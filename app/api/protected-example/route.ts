import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { unauthorizedResponse, successResponse } from '@/lib/api-response'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return unauthorizedResponse()
  }
  
  return successResponse({
    message: 'This is protected data',
    user: session.user
  })
}
