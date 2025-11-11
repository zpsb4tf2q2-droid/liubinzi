import { jest } from '@jest/globals'

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`)
  }),
}))

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: { id: '123', email: 'test@example.com' } },
            error: null,
          }),
        },
      }
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const { signIn } = await import('@/lib/actions/auth')

      await expect(signIn('test@example.com', 'password123')).rejects.toThrow('NEXT_REDIRECT')
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should return error for invalid credentials', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid login credentials' },
          }),
        },
      }
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const { signIn } = await import('@/lib/actions/auth')

      const result = await signIn('test@example.com', 'wrongpassword')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid login credentials')
    })

    it('should redirect to callback URL if provided', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: { id: '123', email: 'test@example.com' } },
            error: null,
          }),
        },
      }
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const { signIn } = await import('@/lib/actions/auth')

      await expect(signIn('test@example.com', 'password123', '/posts')).rejects.toThrow('NEXT_REDIRECT: /posts')
    })
  })

  describe('signUp', () => {
    it('should sign up successfully with valid data', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: { user: { id: '123', email: 'test@example.com' } },
            error: null,
          }),
        },
      }
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const { signUp } = await import('@/lib/actions/auth')

      await expect(signUp('test@example.com', 'password123', 'Test User')).rejects.toThrow('NEXT_REDIRECT')
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
          },
        },
      })
    })

    it('should return error when email already exists', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'User already registered' },
          }),
        },
      }
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const { signUp } = await import('@/lib/actions/auth')

      const result = await signUp('test@example.com', 'password123')
      expect(result.success).toBe(false)
      expect(result.error).toBe('User already registered')
    })

    it('should handle empty name field', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          signUp: jest.fn().mockResolvedValue({
            data: { user: { id: '123', email: 'test@example.com' } },
            error: null,
          }),
        },
      }
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const { signUp } = await import('@/lib/actions/auth')

      await expect(signUp('test@example.com', 'password123')).rejects.toThrow('NEXT_REDIRECT')
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: '',
          },
        },
      })
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          signOut: jest.fn().mockResolvedValue({ error: null }),
        },
      }
      ;(createServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabase)

      const { signOut } = await import('@/lib/actions/auth')

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT')
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })
})
