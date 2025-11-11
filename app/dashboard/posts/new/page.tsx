import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPost } from '@/lib/actions/posts'
import PostForm from '@/components/PostForm'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Post</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Write and publish your new post</p>
      </div>

      <PostForm
        mode="create"
        onSubmit={createPost}
      />
    </div>
  )
}
