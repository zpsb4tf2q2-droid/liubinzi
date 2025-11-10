import { describe, it, expect, jest, beforeEach } from '@jest/globals'

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}))

describe('Analytics Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAnalytics', () => {
    it('should return null if user is not authenticated', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getAnalytics } = await import('../analytics')
      
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }
      
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)
      
      const result = await getAnalytics()
      
      expect(result).toBeNull()
    })

    it('should return analytics data for authenticated user', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getAnalytics } = await import('../analytics')
      
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => ({ data: [] })),
              })),
            })),
            gte: jest.fn(() => ({ data: [] })),
          })),
        })),
      }
      
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)
      
      const result = await getAnalytics()
      
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('totalPosts')
      expect(result).toHaveProperty('publishedPosts')
      expect(result).toHaveProperty('draftPosts')
      expect(result).toHaveProperty('totalComments')
      expect(result).toHaveProperty('totalLikes')
    })

    it('should calculate engagement metrics correctly', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getAnalytics } = await import('../analytics')
      
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => ({ 
                  data: [
                    { id: '1', title: 'Post 1', status: 'published' },
                    { id: '2', title: 'Post 2', status: 'published' },
                  ] 
                })),
              })),
            })),
            gte: jest.fn(() => ({ 
              data: [
                { created_at: '2024-01-01' },
                { created_at: '2024-01-02' },
              ] 
            })),
          })),
        })),
      }
      
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)
      
      const result = await getAnalytics()
      
      expect(result).not.toBeNull()
      expect(Array.isArray(result?.postsWithEngagement)).toBe(true)
      expect(Array.isArray(result?.activityTimeline)).toBe(true)
    })

    it('should handle errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getAnalytics } = await import('../analytics')
      
      ;(createServerSupabaseClient as jest.Mock).mockRejectedValue(new Error('Database error'))
      
      const result = await getAnalytics()
      
      expect(result).toBeNull()
    })
  })

  describe('getUserRole', () => {
    it('should return null if user is not authenticated', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getUserRole } = await import('../analytics')
      
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }
      
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)
      
      const result = await getUserRole()
      
      expect(result).toBeNull()
    })

    it('should return author role for authenticated user', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getUserRole } = await import('../analytics')
      
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }
      
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)
      
      const result = await getUserRole()
      
      expect(result).toBe('author')
    })

    it('should handle errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getUserRole } = await import('../analytics')
      
      ;(createServerSupabaseClient as jest.Mock).mockRejectedValue(new Error('Auth error'))
      
      const result = await getUserRole()
      
      expect(result).toBeNull()
    })
  })
})
