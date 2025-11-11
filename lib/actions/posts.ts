'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PostWithDetails } from '@/lib/types'

export async function getPost(postId: string): Promise<PostWithDetails | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error || !post) {
      return null
    }

    const [commentCountResult, likeCountResult, userLikeResult] = await Promise.all([
      supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId),
      supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId),
      user ? supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle() : Promise.resolve({ data: null })
    ])

    return {
      ...post,
      comment_count: commentCountResult.count || 0,
      like_count: likeCountResult.count || 0,
      user_has_liked: !!userLikeResult.data
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function getPosts(limit = 10): Promise<PostWithDetails[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !posts) {
      return []
    }

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const [commentCountResult, likeCountResult, userLikeResult] = await Promise.all([
          supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id),
          supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id),
          user ? supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle() : Promise.resolve({ data: null })
        ])

        return {
          ...post,
          comment_count: commentCountResult.count || 0,
          like_count: likeCountResult.count || 0,
          user_has_liked: !!userLikeResult.data
        }
      })
    )

    return postsWithDetails
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function togglePostLike(postId: string): Promise<{ success: boolean; liked: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, liked: false, error: 'You must be logged in to like posts' }
    }

    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingLike) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) {
        return { success: false, liked: true, error: error.message }
      }

      revalidatePath(`/posts/${postId}`)
      return { success: true, liked: false }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id })

      if (error) {
        return { success: false, liked: false, error: error.message }
      }

      revalidatePath(`/posts/${postId}`)
      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, liked: false, error: 'An unexpected error occurred' }
  }
}

export async function getMyPosts(): Promise<PostWithDetails[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !posts) {
      return []
    }

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const [commentCountResult, likeCountResult] = await Promise.all([
          supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id),
          supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
        ])

        return {
          ...post,
          comment_count: commentCountResult.count || 0,
          like_count: likeCountResult.count || 0
        }
      })
    )

    return postsWithDetails
  } catch (error) {
    console.error('Error fetching my posts:', error)
    return []
  }
}

export async function createPost(
  title: string,
  content: string,
  status: 'draft' | 'published' = 'draft'
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to create posts' }
    }

    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Title is required' }
    }

    if (title.length > 200) {
      return { success: false, error: 'Title must be 200 characters or less' }
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Content is required' }
    }

    if (content.length > 10000) {
      return { success: false, error: 'Content must be 10,000 characters or less' }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        content: content.trim(),
        status,
        author_id: user.id
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/posts')
    return { success: true, postId: data.id }
  } catch (error) {
    console.error('Error creating post:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updatePost(
  postId: string,
  title: string,
  content: string,
  status: 'draft' | 'published'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to update posts' }
    }

    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Title is required' }
    }

    if (title.length > 200) {
      return { success: false, error: 'Title must be 200 characters or less' }
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Content is required' }
    }

    if (content.length > 10000) {
      return { success: false, error: 'Content must be 10,000 characters or less' }
    }

    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (!existingPost) {
      return { success: false, error: 'Post not found' }
    }

    if (existingPost.author_id !== user.id) {
      return { success: false, error: 'You can only update your own posts' }
    }

    const { error } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim(),
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/posts')
    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating post:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to delete posts' }
    }

    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (!existingPost) {
      return { success: false, error: 'Post not found' }
    }

    if (existingPost.author_id !== user.id) {
      return { success: false, error: 'You can only delete your own posts' }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/posts')
    return { success: true }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
