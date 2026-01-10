import { supabase } from './supabase'

// Check if user is admin by email
export async function isAdmin(email: string | undefined | null): Promise<boolean> {
  if (!email) return false
  
  const emailLower = email.toLowerCase()
  const INITIAL_ADMIN = 'fakysinghyo@gmail.com'
  
  // Always check initial admin first (hardcoded fallback)
  if (emailLower === INITIAL_ADMIN.toLowerCase()) {
    return true
  }
  
  // Check database table (if it exists)
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', emailLower)
      .single()
    
    // If table doesn't exist or error occurs, fallback to hardcoded check
    if (error) {
      // Table might not exist yet - return false for non-initial admin
      return false
    }
    
    return !!data
  } catch (error) {
    // Table might not exist yet - fallback to hardcoded check
    return false
  }
}

// Get all admins from database
export async function getAdmins(): Promise<string[]> {
  const INITIAL_ADMIN = 'fakysinghyo@gmail.com'
  const adminEmails: string[] = [INITIAL_ADMIN.toLowerCase()]
  
  // Try to fetch from database (if table exists)
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .order('email')
    
    if (!error && data) {
      const dbAdmins = data.map(a => a.email.toLowerCase())
      // Merge with initial admin, avoiding duplicates
      dbAdmins.forEach(email => {
        if (!adminEmails.includes(email)) {
          adminEmails.push(email)
        }
      })
    }
  } catch (error) {
    // Table might not exist yet - return just initial admin
    console.warn('Admins table may not exist yet:', error)
  }
  
  return adminEmails
}

// Add admin (requires existing admin)
export async function addAdmin(email: string): Promise<void> {
  const emailLower = email.toLowerCase()
  const INITIAL_ADMIN = 'fakysinghyo@gmail.com'
  
  // Can't add initial admin (it's hardcoded)
  if (emailLower === INITIAL_ADMIN.toLowerCase()) {
    throw new Error('This admin already exists')
  }
  
  // Check if already admin
  try {
    const { data: existing, error: checkError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', emailLower)
      .single()
    
    if (existing) {
      throw new Error('This email is already an admin')
    }
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found, which is OK
      throw checkError
    }
    
    // Insert into database
    const { error } = await supabase
      .from('admins')
      .insert({ email: emailLower })
    
    if (error) {
      // If table doesn't exist, throw error with helpful message
      if (error.code === '42P01') { // Table doesn't exist
        throw new Error('Admins table does not exist. Please run the database migration first.')
      }
      throw error
    }
  } catch (error: any) {
    if (error.message) {
      throw error
    }
    throw new Error('Failed to add admin: ' + (error?.message || 'Unknown error'))
  }
}

// Remove admin (requires existing admin)
export async function removeAdmin(email: string): Promise<void> {
  const emailLower = email.toLowerCase()
  const INITIAL_ADMIN = 'fakysinghyo@gmail.com'
  
  // Prevent removing initial admin
  if (emailLower === INITIAL_ADMIN.toLowerCase()) {
    throw new Error('Cannot remove the initial admin')
  }
  
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('email', emailLower)
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        throw new Error('Admins table does not exist. Please run the database migration first.')
      }
      throw error
    }
  } catch (error: any) {
    if (error.message) {
      throw error
    }
    throw new Error('Failed to remove admin: ' + (error?.message || 'Unknown error'))
  }
}

// User interface for admin panel
export interface AdminUser {
  id: string
  email: string
  created_at?: string
  role?: string
}

// Get all users (requires admin privileges)
export async function getAllUsers(): Promise<AdminUser[]> {
  // Get unique user IDs from rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('owner_id, created_at')
  
  // Get unique user IDs from conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('owner_id, finder_id, created_at')
  
  const userIds = new Map<string, { email: string; created_at?: string; role?: string }>()
  
  // Get current user's email for reference
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // Add users from rooms
  rooms?.forEach(room => {
    if (room.owner_id && !userIds.has(room.owner_id)) {
      userIds.set(room.owner_id, {
        email: currentUser?.id === room.owner_id ? currentUser.email || 'Unknown' : 'Unknown',
        created_at: room.created_at,
        role: 'owner'
      })
    }
  })
  
  // Add users from conversations
  conversations?.forEach(conv => {
    if (conv.owner_id && !userIds.has(conv.owner_id)) {
      userIds.set(conv.owner_id, {
        email: currentUser?.id === conv.owner_id ? currentUser.email || 'Unknown' : 'Unknown',
        created_at: conv.created_at,
        role: 'owner'
      })
    }
    if (conv.finder_id && !userIds.has(conv.finder_id)) {
      userIds.set(conv.finder_id, {
        email: currentUser?.id === conv.finder_id ? currentUser.email || 'Unknown' : 'Unknown',
        created_at: conv.created_at,
        role: 'finder'
      })
    }
  })
  
  // Add current user if not already included
  if (currentUser && !userIds.has(currentUser.id)) {
    userIds.set(currentUser.id, {
      email: currentUser.email || 'Unknown',
      created_at: currentUser.created_at,
      role: null
    })
  }
  
  // Convert to array
  return Array.from(userIds.entries()).map(([id, data]) => ({
    id,
    email: data.email,
    created_at: data.created_at,
    role: data.role
  }))
}

// Delete a user (requires admin)
export async function deleteUser(userId: string) {
  // Delete user's rooms first (this will also delete room images)
  const { data: userRooms } = await supabase
    .from('rooms')
    .select('id, images')
    .eq('owner_id', userId)
  
  // Delete room images from storage
  if (userRooms && userRooms.length > 0) {
    for (const room of userRooms) {
      if (room.images && room.images.length > 0) {
        const imagePaths = room.images.map(img => `${room.id}/${img.split('/').pop()}`).filter(Boolean)
        if (imagePaths.length > 0) {
          await supabase.storage.from('room-images').remove(imagePaths)
        }
      }
    }
  }
  
  await supabase.from('rooms').delete().eq('owner_id', userId)
  
  // Delete user's conversations and messages
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`owner_id.eq.${userId},finder_id.eq.${userId}`)
  
  if (conversations && conversations.length > 0) {
    const conversationIds = conversations.map(c => c.id)
    await supabase.from('messages').delete().in('conversation_id', conversationIds)
    await supabase.from('conversations').delete().in('id', conversationIds)
  }
  
  // Note: Actual user deletion from auth.users requires Admin API
  // This function deletes user data, but not the auth user itself
  // For full deletion, you'd need a server-side function using service role key
}

// Get all rooms
export async function getAllRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Delete a room (admin only)
export async function deleteRoom(roomId: string) {
  // Get room to delete associated images
  const { data: room } = await supabase
    .from('rooms')
    .select('images')
    .eq('id', roomId)
    .single()
  
  // Delete images from storage
  if (room?.images && room.images.length > 0) {
    const imagePaths = room.images.map(img => {
      // Handle both full paths and relative paths
      if (img.includes('/')) {
        return img
      }
      return `${roomId}/${img}`
    }).filter(Boolean)
    
    if (imagePaths.length > 0) {
      await supabase.storage.from('room-images').remove(imagePaths)
    }
  }
  
  // Delete conversations and messages related to this room
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('room_id', roomId)
  
  if (conversations && conversations.length > 0) {
    const conversationIds = conversations.map(c => c.id)
    await supabase.from('messages').delete().in('conversation_id', conversationIds)
    await supabase.from('conversations').delete().in('id', conversationIds)
  }
  
  // Delete the room
  const { error } = await supabase.from('rooms').delete().eq('id', roomId)
  if (error) throw error
}

// Get all messages
export async function getAllMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000) // Limit to recent 1000 messages
  
  if (error) throw error
  return data || []
}

// Delete a message
export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
  
  if (error) throw error
}

// Delete all messages in a conversation
export async function deleteConversationMessages(conversationId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId)
  
  if (error) throw error
  
  // Also delete the conversation
  await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
}

// Delete all messages in a conversation
export async function deleteConversationMessages(conversationId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId)
  
  if (error) throw error
  
  // Also delete the conversation
  await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
}
