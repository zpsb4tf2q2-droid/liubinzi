'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface AnalyticsData {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalComments: number
  totalLikes: number
  postsWithEngagement: Array<{
    id: string
    title: string
    comments: number
    likes: number
  }>
  activityTimeline: Array<{
    date: string
    posts: number
    comments: number
    likes: number
  }>
}

export async function getAnalytics(): Promise<AnalyticsData | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    const [
      postsResult,
      commentsResult,
      likesResult,
      postsWithEngagementResult,
      activityResult
    ] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true }),
      getPostsWithEngagement(supabase),
      getActivityTimeline(supabase)
    ])

    const { count: totalPosts } = postsResult
    const { count: totalComments } = commentsResult
    const { count: totalLikes } = likesResult

    const { data: publishedData } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    const { data: draftData } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')

    return {
      totalPosts: totalPosts || 0,
      publishedPosts: publishedData?.length || 0,
      draftPosts: draftData?.length || 0,
      totalComments: totalComments || 0,
      totalLikes: totalLikes || 0,
      postsWithEngagement: postsWithEngagementResult,
      activityTimeline: activityResult
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return null
  }
}

async function getPostsWithEngagement(supabase: any) {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!posts || posts.length === 0) {
      return []
    }

    const postsWithEngagement = await Promise.all(
      posts.map(async (post: any) => {
        const [commentsResult, likesResult] = await Promise.all([
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
          id: post.id,
          title: post.title,
          comments: commentsResult.count || 0,
          likes: likesResult.count || 0
        }
      })
    )

    return postsWithEngagement
  } catch (error) {
    console.error('Error fetching posts with engagement:', error)
    return []
  }
}

async function getActivityTimeline(supabase: any) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [postsData, commentsData, likesData] = await Promise.all([
      supabase
        .from('posts')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('comments')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('likes')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
    ])

    const activityMap = new Map<string, { posts: number; comments: number; likes: number }>()

    const processData = (data: any[], key: 'posts' | 'comments' | 'likes') => {
      if (!data) return
      
      data.forEach((item: any) => {
        const date = new Date(item.created_at).toISOString().split('T')[0]
        const existing = activityMap.get(date) || { posts: 0, comments: 0, likes: 0 }
        existing[key]++
        activityMap.set(date, existing)
      })
    }

    processData(postsData.data, 'posts')
    processData(commentsData.data, 'comments')
    processData(likesData.data, 'likes')

    const timeline = Array.from(activityMap.entries())
      .map(([date, activity]) => ({
        date,
        ...activity
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return timeline
  } catch (error) {
    console.error('Error fetching activity timeline:', error)
    return []
  }
}

export async function getUserRole(): Promise<'admin' | 'author' | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    return 'author'
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}
