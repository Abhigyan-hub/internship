import { supabase } from './supabase'

// Helper to get user email - we'll create a profiles table or use auth metadata
export async function getUserEmail(userId: string): Promise<string> {
  // Try to get from auth metadata first
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) {
    return user.email || ''
  }

  // For other users, we'd need a profiles table
  // For now, return empty string - you can enhance this later
  return ''
}

