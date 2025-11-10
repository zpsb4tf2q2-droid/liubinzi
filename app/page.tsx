import Link from 'next/link'

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
        <p className="text-xl text-gray-600">
          A modern web application built with Next.js and Supabase
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">媒体库</h2>
          <p className="text-gray-600 text-sm mb-4">
            上传和管理您的图片、视频和其他媒体文件
          </p>
          <Link 
            href="/media" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            访问媒体库 →
          </Link>
        </div>
        
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">创建文章</h2>
          <p className="text-gray-600 text-sm mb-4">
            使用内置编辑器撰写和发布内容
          </p>
          <Link 
            href="/articles" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            开始创作 →
          </Link>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Dashboard</h2>
          <p className="text-gray-600 text-sm mb-4">
            Access your personalized dashboard
          </p>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Go to Dashboard →
          </Link>
        </div>
        
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Authentication</h2>
          <p className="text-gray-600 text-sm mb-4">
            Secure user authentication powered by Supabase
          </p>
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Learn more →
          </Link>
        </div>
        
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Get Started</h2>
          <p className="text-gray-600 text-sm mb-4">
            Create an account to get started
          </p>
          <Link 
            href="/register" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Sign up →
          </Link>
        </div>
      </div>
    </div>
  )
}
