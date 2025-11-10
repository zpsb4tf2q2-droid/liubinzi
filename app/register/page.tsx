import Link from 'next/link'
import RegisterForm from '@/components/RegisterForm'
import { Card, CardBody } from '@/components/ui'

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Create your account</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Sign up to get started.
        </p>
      </div>
      <Card>
        <CardBody>
          <RegisterForm />
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link 
          href="/login" 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
