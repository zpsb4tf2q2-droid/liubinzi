import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import type { SupabaseClient } from '@supabase/supabase-js'

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Comments Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getComments', () => {
    it('should return empty array if no comments found', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getComments } = await import('../comments')

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                order: jest.fn(() => ({ data: [], error: null })),
              })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getComments('post-123')

      expect(result).toEqual([])
    })

    it('should return comments with replies for a post', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getComments } = await import('../comments')

      const mockComment1 = {
        id: 'comment-1',
        post_id: 'post-123',
        user_id: 'user-1',
        parent_id: null,
        content: 'First comment',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockComment2 = {
        id: 'comment-2',
        post_id: 'post-123',
        user_id: 'user-2',
        parent_id: null,
        content: 'Second comment',
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      }

      const mockReply = {
        id: 'reply-1',
        post_id: 'post-123',
        user_id: 'user-3',
        parent_id: 'comment-1',
        content: 'Reply to first comment',
        created_at: '2024-01-03',
        updated_at: '2024-01-03',
      }

      let callCount = 0
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn((field: string, value: string) => {
              if (field === 'parent_id' && value === 'comment-1') {
                return {
                  order: jest.fn(() => ({ data: [mockReply], error: null })),
                }
              }
              if (field === 'parent_id' && value === 'comment-2') {
                return {
                  order: jest.fn(() => ({ data: [], error: null })),
                }
              }
              return {
                is: jest.fn(() => ({
                  order: jest.fn(() => ({ data: [mockComment1, mockComment2], error: null })),
                })),
              }
            }),
            is: jest.fn(() => ({
              order: jest.fn(() => ({ data: [mockComment1, mockComment2], error: null })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getComments('post-123')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('comment-1')
      expect(result[0].replies).toHaveLength(1)
      expect(result[0].replies?.[0].id).toBe('reply-1')
      expect(result[1].id).toBe('comment-2')
      expect(result[1].replies).toHaveLength(0)
    })

    it('should return empty array on error', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getComments } = await import('../comments')

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                order: jest.fn(() => ({ data: null, error: new Error('Database error') })),
              })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getComments('post-123')

      expect(result).toEqual([])
    })
  })

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createComment } = await import('../comments')

      const mockComment = {
        id: 'comment-1',
        post_id: 'post-123',
        user_id: 'user-123',
        parent_id: null,
        content: 'Test comment',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({ data: mockComment, error: null })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createComment('post-123', 'Test comment')

      expect(result.success).toBe(true)
      expect(result.comment).toEqual(mockComment)
      expect(result.error).toBeUndefined()
    })

    it('should fail if user is not logged in', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createComment } = await import('../comments')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createComment('post-123', 'Test comment')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You must be logged in to comment')
    })

    it('should fail if comment is empty', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createComment } = await import('../comments')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createComment('post-123', '   ')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Comment cannot be empty')
    })

    it('should create a reply to a comment', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createComment } = await import('../comments')

      const mockReply = {
        id: 'reply-1',
        post_id: 'post-123',
        user_id: 'user-123',
        parent_id: 'comment-1',
        content: 'Test reply',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'comments') {
            const hasParent = jest.fn()
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ data: { parent_id: null }, error: null })),
                })),
              })),
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => ({ data: mockReply, error: null })),
                })),
              })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createComment('post-123', 'Test reply', 'comment-1')

      expect(result.success).toBe(true)
      expect(result.comment?.parent_id).toBe('comment-1')
    })

    it('should fail when trying to reply to a reply (no nested nesting)', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createComment } = await import('../comments')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ 
                data: { parent_id: 'comment-1' }, 
                error: null 
              })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createComment('post-123', 'Test reply', 'reply-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot reply to a reply (only one level of nesting allowed)')
    })

    it('should handle database errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createComment } = await import('../comments')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({ 
                data: null, 
                error: { message: 'Database error' } 
              })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createComment('post-123', 'Test comment')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('deleteComment', () => {
    it('should delete own comment successfully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deleteComment } = await import('../comments')

      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          callCount++
          if (table === 'comments' && callCount === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { 
                      user_id: 'user-123', 
                      post_id: 'post-123' 
                    }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { author_id: 'user-456' }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          if (table === 'comments' && callCount > 1) {
            return {
              delete: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
            }
          }
          return {
            delete: jest.fn(() => ({
              eq: jest.fn(() => ({ error: null })),
            })),
          }
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deleteComment('comment-1', 'post-123')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail if user is not logged in', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deleteComment } = await import('../comments')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deleteComment('comment-1', 'post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You must be logged in to delete comments')
    })

    it('should fail if comment not found', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deleteComment } = await import('../comments')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ data: null, error: null })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deleteComment('non-existent', 'post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Comment not found')
    })

    it('should fail if user tries to delete someone elses comment', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deleteComment } = await import('../comments')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          if (table === 'comments') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { 
                      user_id: 'user-456', 
                      post_id: 'post-123' 
                    }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { author_id: 'user-789' }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deleteComment('comment-1', 'post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You can only delete your own comments or comments on your posts')
    })

    it('should allow post author to delete any comment on their post', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deleteComment } = await import('../comments')

      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          callCount++
          if (table === 'comments' && callCount === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { 
                      user_id: 'user-456', 
                      post_id: 'post-123' 
                    }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { author_id: 'user-123' }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          if (table === 'comments' && callCount > 1) {
            return {
              delete: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
            }
          }
          return {
            delete: jest.fn(() => ({
              eq: jest.fn(() => ({ error: null })),
            })),
          }
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deleteComment('comment-1', 'post-123')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle database errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deleteComment } = await import('../comments')

      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
        from: jest.fn((table: string) => {
          callCount++
          if (table === 'comments' && callCount === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { 
                      user_id: 'user-123', 
                      post_id: 'post-123' 
                    }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ 
                    data: { author_id: 'user-456' }, 
                    error: null 
                  })),
                })),
              })),
            }
          }
          if (table === 'comments' && callCount > 1) {
            return {
              delete: jest.fn(() => ({
                eq: jest.fn(() => ({ error: { message: 'Database error' } })),
              })),
            }
          }
          return {
            delete: jest.fn(() => ({
              eq: jest.fn(() => ({ error: { message: 'Database error' } })),
            })),
          }
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deleteComment('comment-1', 'post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should handle unexpected errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deleteComment } = await import('../comments')

      ;(createServerSupabaseClient as jest.Mock).mockRejectedValue(new Error('Unexpected error'))

      const result = await deleteComment('comment-1', 'post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
    })
  })
})
