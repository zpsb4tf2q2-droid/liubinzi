/**
 * Data access utilities for comments
 * Pure Supabase query functions without business logic
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Comment, CommentWithUser } from '@/lib/types'

/**
 * Fetch all top-level comments for a post
 */
export async function fetchTopLevelComments(
  postId: string
): Promise<Comment[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`)
  }
  
  return data || []
}

/**
 * Fetch replies for a specific comment
 */
export async function fetchReplies(commentId: string): Promise<Comment[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('parent_id', commentId)
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to fetch replies: ${error.message}`)
  }
  
  return data || []
}

/**
 * Fetch comments tree with nested replies (one level deep)
 */
export async function fetchCommentsTree(
  postId: string
): Promise<CommentWithUser[]> {
  const topLevelComments = await fetchTopLevelComments(postId)
  
  const commentsWithReplies = await Promise.all(
    topLevelComments.map(async (comment) => {
      const replies = await fetchReplies(comment.id)
      return {
        ...comment,
        replies: replies as CommentWithUser[]
      }
    })
  )
  
  return commentsWithReplies
}

/**
 * Fetch a single comment by ID
 */
export async function fetchCommentById(
  commentId: string
): Promise<Comment | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single()
  
  if (error) {
    return null
  }
  
  return data
}

/**
 * Create a new comment
 */
export async function insertComment(
  postId: string,
  userId: string,
  content: string,
  parentId?: string | null
): Promise<Comment> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
      parent_id: parentId || null
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`)
  }
  
  return data
}

/**
 * Update a comment's content
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<Comment> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update comment: ${error.message}`)
  }
  
  return data
}

/**
 * Delete a comment
 */
export async function deleteCommentById(commentId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  
  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`)
  }
}

/**
 * Delete all comments (and replies) for a post
 */
export async function deleteCommentsByPostId(postId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('post_id', postId)
  
  if (error) {
    throw new Error(`Failed to delete post comments: ${error.message}`)
  }
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  
  if (error) {
    throw new Error(`Failed to count comments: ${error.message}`)
  }
  
  return count || 0
}

/**
 * Get comment counts for multiple posts
 */
export async function getCommentCounts(
  postIds: string[]
): Promise<Record<string, number>> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds)
  
  if (error) {
    throw new Error(`Failed to count comments: ${error.message}`)
  }
  
  // Aggregate counts by post_id
  const counts: Record<string, number> = {}
  postIds.forEach(id => counts[id] = 0)
  
  data?.forEach(comment => {
    counts[comment.post_id] = (counts[comment.post_id] || 0) + 1
  })
  
  return counts
}
