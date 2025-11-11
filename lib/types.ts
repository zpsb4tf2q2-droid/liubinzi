// Shared types for the application
// Add your custom types here as needed

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database types will go here
// You can generate these from your Supabase schema using:
// npx supabase gen types typescript --project-id your-project-id > lib/database.types.ts
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          content: string
          status: 'draft' | 'published'
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          status?: 'draft' | 'published'
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          status?: 'draft' | 'published'
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      // Your views will be defined here
    }
    Functions: {
      // Your functions will be defined here
    }
    Enums: {
      // Your enums will be defined here
    }
  }
}

export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export interface CommentWithUser extends Comment {
  user?: {
    id: string
    email?: string
  }
  replies?: CommentWithUser[]
}

export interface PostWithDetails extends Post {
  author?: {
    id: string
    email?: string
  }
  comment_count?: number
  like_count?: number
  user_has_liked?: boolean
}
