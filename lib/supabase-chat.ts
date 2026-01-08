import { supabase } from './supabase'

export interface Conversation {
  id: string
  owner_id: string
  finder_id: string
  room_id: string
  created_at: string
  room?: {
    title: string
    location: string
    images: string[]
  }
  owner?: {
    email: string
  }
  finder?: {
    email: string
  }
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  created_at: string
  read_at?: string | null
  sender?: {
    email: string
  }
}

export interface ConversationWithUnread extends Conversation {
  unread_count?: number
  last_message?: Message
}

// Create or get existing conversation
export async function getOrCreateConversation(
  ownerId: string,
  finderId: string,
  roomId: string
): Promise<Conversation | null> {
  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('finder_id', finderId)
    .eq('room_id', roomId)
    .single()

  if (existing) {
    return existing as Conversation
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      owner_id: ownerId,
      finder_id: finderId,
      room_id: roomId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }

  return data as Conversation
}

// Get conversations for a user with unread counts
export async function getUserConversations(
  userId: string
): Promise<ConversationWithUnread[]> {
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .or(`owner_id.eq.${userId},finder_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (convError) {
    console.error('Error fetching conversations:', convError)
    return []
  }

  if (!conversations || conversations.length === 0) {
    return []
  }

  // Fetch room details for each conversation
  const roomIds = conversations.map(c => c.room_id)
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, title, location, images')
    .in('id', roomIds)

  // Get unread counts and last messages for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      // Get unread count (messages not sent by user and not read)
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', userId)
        .is('read_at', null)

      // Get last message
      const { data: lastMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)

      return {
        ...conv,
        room: rooms?.find(r => r.id === conv.room_id),
        owner: { id: conv.owner_id, email: '' },
        finder: { id: conv.finder_id, email: '' },
        unread_count: unreadCount || 0,
        last_message: lastMessages?.[0] as Message | undefined,
      } as ConversationWithUnread
    })
  )

  return conversationsWithUnread
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    // Mark all unread messages from other users as read
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null)

    if (error) {
      console.error('Error marking messages as read:', error)
      // Fallback: try using the function if direct update fails
      const { error: funcError } = await supabase.rpc('mark_conversation_read', {
        p_conversation_id: conversationId,
        p_user_id: userId,
      })
      if (funcError) {
        console.error('Error using mark_conversation_read function:', funcError)
      }
    }
  } catch (error) {
    console.error('Error in markConversationAsRead:', error)
  }
}

// Get messages for a conversation
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return (data || []) as Message[]
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  message: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message,
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return null
  }

  return data as Message
}

// Subscribe to new messages
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

