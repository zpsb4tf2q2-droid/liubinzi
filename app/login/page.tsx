import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import { Card, CardBody } from '@/components/ui'

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Sign in</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Please sign in to continue.
        </p>
      </div>
      <Card>
        <CardBody>
          <LoginForm />
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link 
          href="/register" 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          Register
        </Link>
      </p>
    </div>
  )
}
