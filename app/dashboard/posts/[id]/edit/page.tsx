import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPost, updatePost, deletePost } from '@/lib/actions/posts'
import PostForm from '@/components/PostForm'

export const dynamic = 'force-dynamic'

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  if (post.author_id !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Post</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Make changes to your post</p>
      </div>

      <PostForm
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
          status: post.status
        }}
        onSubmit={async (title, content, status) => {
          'use server'
          return updatePost(id, title, content, status)
        }}
        onDelete={async () => {
          'use server'
          return deletePost(id)
        }}
      />
    </div>
  )
}
