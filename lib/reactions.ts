/**
 * Data access utilities for reactions (likes)
 * Pure Supabase query functions without business logic
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Like } from '@/lib/types'

/**
 * Check if a user has liked a post
 */
export async function hasUserLikedPost(
  postId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  
  if (error) {
    throw new Error(`Failed to check like status: ${error.message}`)
  }
  
  return !!data
}

/**
 * Get a specific like record
 */
export async function fetchLike(
  postId: string,
  userId: string
): Promise<Like | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  
  if (error) {
    return null
  }
  
  return data
}

/**
 * Create a like for a post
 */
export async function createLike(
  postId: string,
  userId: string
): Promise<Like> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create like: ${error.message}`)
  }
  
  return data
}

/**
 * Delete a like
 */
export async function deleteLike(
  postId: string,
  userId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
  
  if (error) {
    throw new Error(`Failed to delete like: ${error.message}`)
  }
}

/**
 * Delete all likes for a post
 */
export async function deleteLikesByPostId(postId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
  
  if (error) {
    throw new Error(`Failed to delete post likes: ${error.message}`)
  }
}

/**
 * Get like count for a post
 */
export async function getLikeCount(postId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  
  if (error) {
    throw new Error(`Failed to count likes: ${error.message}`)
  }
  
  return count || 0
}

/**
 * Get like counts for multiple posts
 */
export async function getLikeCounts(
  postIds: string[]
): Promise<Record<string, number>> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('likes')
    .select('post_id')
    .in('post_id', postIds)
  
  if (error) {
    throw new Error(`Failed to count likes: ${error.message}`)
  }
  
  // Aggregate counts by post_id
  const counts: Record<string, number> = {}
  postIds.forEach(id => counts[id] = 0)
  
  data?.forEach(like => {
    counts[like.post_id] = (counts[like.post_id] || 0) + 1
  })
  
  return counts
}

/**
 * Get all likes for a post
 */
export async function fetchPostLikes(postId: string): Promise<Like[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch likes: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get all posts a user has liked
 */
export async function fetchUserLikes(userId: string): Promise<Like[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch user likes: ${error.message}`)
  }
  
  return data || []
}
