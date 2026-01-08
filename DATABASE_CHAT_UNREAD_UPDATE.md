# Chat Unread Messages Update

Run this SQL in your Supabase SQL Editor to add unread message tracking.

## Step 1: Add read_at column to messages table

```sql
-- Add read_at column to track when a message was read
ALTER TABLE messages
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX idx_messages_read_at ON messages(read_at) WHERE read_at IS NULL;
```

## Step 2: Add last_read_at to conversations table (optional optimization)

This helps track the last time a user read messages in a conversation.

```sql
-- Add last_read_at columns to track per-user read status
ALTER TABLE conversations
ADD COLUMN owner_last_read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN finder_last_read_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX idx_conversations_owner_read ON conversations(owner_last_read_at);
CREATE INDEX idx_conversations_finder_read ON conversations(finder_last_read_at);
```

## Step 3: Create function to mark messages as read

```sql
-- Function to mark all messages in a conversation as read for a user
CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  -- Mark all unread messages in this conversation as read
  UPDATE messages
  SET read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read_at IS NULL;
    
  -- Update conversation last_read_at
  UPDATE conversations
  SET 
    owner_last_read_at = CASE WHEN owner_id = p_user_id THEN NOW() ELSE owner_last_read_at END,
    finder_last_read_at = CASE WHEN finder_id = p_user_id THEN NOW() ELSE finder_last_read_at END
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 4: Grant execute permission

```sql
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_conversation_read(UUID, UUID) TO authenticated;
```

## Notes

- `read_at` is NULL for unread messages
- When a user opens a conversation, all messages from the other user are marked as read
- The `last_read_at` columns help optimize queries for unread counts
- Messages sent by the current user are always considered "read" (they don't need to read their own messages)

