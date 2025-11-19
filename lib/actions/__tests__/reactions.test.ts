import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import type { SupabaseClient } from '@supabase/supabase-js'

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Reactions (Likes) Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('togglePostLike', () => {
    it('should add a like when user has not liked the post', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'likes') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: null })),
                  })),
                })),
              })),
              insert: jest.fn(() => ({ error: null })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await togglePostLike('post-123')

      expect(result.success).toBe(true)
      expect(result.liked).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should remove a like when user has already liked the post', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockLike = {
        id: 'like-123',
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: '2024-01-01',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'likes') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: mockLike })),
                  })),
                })),
              })),
              delete: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await togglePostLike('post-123')

      expect(result.success).toBe(true)
      expect(result.liked).toBe(false)
      expect(result.error).toBeUndefined()
    })

    it('should fail if user is not logged in', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await togglePostLike('post-123')

      expect(result.success).toBe(false)
      expect(result.liked).toBe(false)
      expect(result.error).toBe('You must be logged in to like posts')
    })

    it('should handle database error when adding like', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'likes') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: null })),
                  })),
                })),
              })),
              insert: jest.fn(() => ({ error: { message: 'Database error' } })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await togglePostLike('post-123')

      expect(result.success).toBe(false)
      expect(result.liked).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should handle database error when removing like', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockLike = {
        id: 'like-123',
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: '2024-01-01',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'likes') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: mockLike })),
                  })),
                })),
              })),
              delete: jest.fn(() => ({
                eq: jest.fn(() => ({ error: { message: 'Database error' } })),
              })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await togglePostLike('post-123')

      expect(result.success).toBe(false)
      expect(result.liked).toBe(true)
      expect(result.error).toBe('Database error')
    })

    it('should handle unexpected errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      ;(createServerSupabaseClient as jest.Mock).mockRejectedValue(new Error('Unexpected error'))

      const result = await togglePostLike('post-123')

      expect(result.success).toBe(false)
      expect(result.liked).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
    })

    it('should handle duplicate like constraint violation', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'likes') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: null })),
                  })),
                })),
              })),
              insert: jest.fn(() => ({ 
                error: { 
                  message: 'duplicate key value violates unique constraint "likes_post_id_user_id_key"' 
                } 
              })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await togglePostLike('post-123')

      expect(result.success).toBe(false)
      expect(result.liked).toBe(false)
      expect(result.error).toContain('duplicate key')
    })
  })
})
