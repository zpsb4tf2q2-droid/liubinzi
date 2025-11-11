import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import type { SupabaseClient } from '@supabase/supabase-js'

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Posts Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPost', () => {
    it('should return null if post not found', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getPost } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ data: null, error: new Error('Not found') })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getPost('non-existent-id')

      expect(result).toBeNull()
    })

    it('should return post with details for guest user', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getPost } = await import('../posts')

      const mockPost = {
        id: 'post-123',
        title: 'Test Post',
        content: 'Test content',
        status: 'published',
        author_id: 'user-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ data: mockPost, error: null })),
                })),
              })),
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({ count: 5 })),
            })),
          }
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getPost('post-123')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('post-123')
      expect(result?.comment_count).toBe(5)
      expect(result?.like_count).toBe(5)
      expect(result?.user_has_liked).toBe(false)
    })

    it('should return post with user like status for authenticated user', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getPost } = await import('../posts')

      const mockPost = {
        id: 'post-123',
        title: 'Test Post',
        content: 'Test content',
        status: 'published',
        author_id: 'user-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockUser = { id: 'user-456', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ data: mockPost, error: null })),
                })),
              })),
            }
          }
          if (table === 'comments') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({ count: 3 })),
              })),
            }
          }
          if (table === 'likes') {
            return {
              select: jest.fn((fields: string) => {
                if (fields === 'id') {
                  return {
                    eq: jest.fn((field: string) => ({
                      eq: jest.fn(() => ({
                        maybeSingle: jest.fn(() => ({ data: { id: 'like-123' } })),
                      })),
                    })),
                  }
                }
                return {
                  eq: jest.fn(() => ({ count: 10 })),
                }
              }),
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({ count: 0 })),
            })),
          }
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getPost('post-123')

      expect(result).not.toBeNull()
      expect(result?.user_has_liked).toBe(true)
    })

    it('should handle errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getPost } = await import('../posts')

      ;(createServerSupabaseClient as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getPost('post-123')

      expect(result).toBeNull()
    })
  })

  describe('getPosts', () => {
    it('should return only published posts', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getPosts } = await import('../posts')

      const mockPosts = [
        {
          id: 'post-1',
          title: 'Post 1',
          content: 'Content 1',
          status: 'published',
          author_id: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 'post-2',
          title: 'Post 2',
          content: 'Content 2',
          status: 'published',
          author_id: 'user-2',
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
        },
      ]

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  order: jest.fn(() => ({
                    limit: jest.fn(() => ({ data: mockPosts, error: null })),
                  })),
                })),
              })),
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({ count: 0 })),
            })),
          }
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getPosts(10)

      expect(result.length).toBe(2)
      expect(result[0].id).toBe('post-1')
      expect(result[1].id).toBe('post-2')
    })

    it('should return empty array on error', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getPosts } = await import('../posts')

      ;(createServerSupabaseClient as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getPosts()

      expect(result).toEqual([])
    })
  })

  describe('getMyPosts', () => {
    it('should return empty array if user not authenticated', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getMyPosts } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getMyPosts()

      expect(result).toEqual([])
    })

    it('should return all user posts (drafts and published)', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { getMyPosts } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Draft Post',
          content: 'Content 1',
          status: 'draft',
          author_id: 'user-123',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 'post-2',
          title: 'Published Post',
          content: 'Content 2',
          status: 'published',
          author_id: 'user-123',
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
        },
      ]

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  order: jest.fn(() => ({ data: mockPosts, error: null })),
                })),
              })),
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({ count: 0 })),
            })),
          }
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await getMyPosts()

      expect(result.length).toBe(2)
      expect(result[0].status).toBe('draft')
      expect(result[1].status).toBe('published')
    })
  })

  describe('createPost', () => {
    it('should create post successfully with valid data', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockCreatedPost = {
        id: 'new-post-id',
        title: 'New Post',
        content: 'Post content',
        status: 'draft',
        author_id: 'user-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({ data: mockCreatedPost, error: null })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createPost('New Post', 'Post content', 'draft')

      expect(result.success).toBe(true)
      expect(result.postId).toBe('new-post-id')
      expect(result.error).toBeUndefined()
    })

    it('should fail if user not authenticated', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createPost('New Post', 'Post content')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You must be logged in to create posts')
    })

    it('should fail if title is empty', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createPost('', 'Post content')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Title is required')
    })

    it('should fail if title exceeds 200 characters', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const longTitle = 'a'.repeat(201)
      const result = await createPost(longTitle, 'Post content')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Title must be 200 characters or less')
    })

    it('should fail if content is empty', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createPost('New Post', '')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Content is required')
    })

    it('should fail if content exceeds 10000 characters', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const longContent = 'a'.repeat(10001)
      const result = await createPost('New Post', longContent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Content must be 10,000 characters or less')
    })

    it('should trim whitespace from title and content', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockCreatedPost = {
        id: 'new-post-id',
        title: 'New Post',
        content: 'Post content',
        status: 'draft',
        author_id: 'user-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      let capturedInsertData: any

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn(() => ({
          insert: jest.fn((data: any) => {
            capturedInsertData = data
            return {
              select: jest.fn(() => ({
                single: jest.fn(() => ({ data: mockCreatedPost, error: null })),
              })),
            }
          }),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      await createPost('  New Post  ', '  Post content  ')

      expect(capturedInsertData.title).toBe('New Post')
      expect(capturedInsertData.content).toBe('Post content')
    })

    it('should handle database errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { createPost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({ data: null, error: new Error('Database error') })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await createPost('New Post', 'Post content')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('updatePost', () => {
    it('should update post successfully when user is author', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { updatePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockPost = {
        id: 'post-123',
        author_id: 'user-123',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ data: mockPost, error: null })),
                })),
              })),
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await updatePost('post-123', 'Updated Title', 'Updated Content', 'published')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail if user not authenticated', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { updatePost } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await updatePost('post-123', 'Updated Title', 'Updated Content', 'published')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You must be logged in to update posts')
    })

    it('should fail if post not found', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { updatePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ data: null, error: new Error('Not found') })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await updatePost('non-existent', 'Updated Title', 'Updated Content', 'published')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Post not found')
    })

    it('should fail if user is not the author', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { updatePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockPost = {
        id: 'post-123',
        author_id: 'different-user',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ data: mockPost, error: null })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await updatePost('post-123', 'Updated Title', 'Updated Content', 'published')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You can only update your own posts')
    })

    it('should fail if title is empty', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { updatePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await updatePost('post-123', '', 'Updated Content', 'published')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Title is required')
    })

    it('should fail if content is empty', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { updatePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await updatePost('post-123', 'Updated Title', '', 'published')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Content is required')
    })
  })

  describe('deletePost', () => {
    it('should delete post successfully when user is author', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deletePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockPost = {
        id: 'post-123',
        author_id: 'user-123',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ data: mockPost, error: null })),
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

      const result = await deletePost('post-123')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail if user not authenticated', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deletePost } = await import('../posts')

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deletePost('post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You must be logged in to delete posts')
    })

    it('should fail if post not found', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deletePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ data: null, error: new Error('Not found') })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deletePost('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Post not found')
    })

    it('should fail if user is not the author', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deletePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockPost = {
        id: 'post-123',
        author_id: 'different-user',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ data: mockPost, error: null })),
            })),
          })),
        })),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deletePost('post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You can only delete your own posts')
    })

    it('should handle database errors gracefully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { deletePost } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockPost = {
        id: 'post-123',
        author_id: 'user-123',
      }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'posts') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ data: mockPost, error: null })),
                })),
              })),
              delete: jest.fn(() => ({
                eq: jest.fn(() => ({ error: new Error('Database error') })),
              })),
            }
          }
          return {}
        }),
      }

      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await deletePost('post-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('togglePostLike', () => {
    it('should add like when user has not liked the post', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
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

    it('should remove like when user has already liked the post', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'likes') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: { id: 'like-123' } })),
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

    it('should fail if user not authenticated', async () => {
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

    it('should handle errors when adding like', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
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
              insert: jest.fn(() => ({ error: new Error('Database error') })),
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

    it('should handle errors when removing like', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const { togglePostLike } = await import('../posts')

      const mockUser = { id: 'user-123', email: 'test@example.com' }

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn((table: string) => {
          if (table === 'likes') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: { id: 'like-123' } })),
                  })),
                })),
              })),
              delete: jest.fn(() => ({
                eq: jest.fn(() => ({ error: new Error('Database error') })),
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
  })
})
