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
      // Your tables will be defined here
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
