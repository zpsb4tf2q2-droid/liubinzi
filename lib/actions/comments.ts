'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CommentWithUser } from '@/lib/types'

export async function getComments(postId: string): Promise<CommentWithUser[]> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error || !comments) {
      return []
    }

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select('*')
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || []
        }
      })
    )

    return commentsWithReplies
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string | null
): Promise<{ success: boolean; error?: string; comment?: CommentWithUser }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to comment' }
    }

    if (!content.trim()) {
      return { success: false, error: 'Comment cannot be empty' }
    }

    if (parentId) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('parent_id')
        .eq('id', parentId)
        .single()

      if (parentComment?.parent_id) {
        return { success: false, error: 'Cannot reply to a reply (only one level of nesting allowed)' }
      }
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null
      })
      .select()
      .single()

    if (error || !comment) {
      return { success: false, error: error?.message || 'Failed to create comment' }
    }

    revalidatePath(`/posts/${postId}`)
    return { success: true, comment }
  } catch (error) {
    console.error('Error creating comment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteComment(
  commentId: string,
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to delete comments' }
    }

    const { data: comment } = await supabase
      .from('comments')
      .select('user_id, post_id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', comment.post_id)
      .single()

    if (comment.user_id !== user.id && post?.author_id !== user.id) {
      return { success: false, error: 'You can only delete your own comments or comments on your posts' }
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
