'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface AuthResult {
  success: boolean
  error?: string
}

export async function signIn(email: string, password: string, callbackUrl?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    
    if (callbackUrl && callbackUrl.startsWith('/')) {
      redirect(callbackUrl)
    } else {
      redirect('/dashboard')
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create account. Please try again.' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
