# Chat Database Setup

Run this SQL in your Supabase SQL Editor to set up the chat functionality.

## Step 1: Create Conversations Table

```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  finder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(owner_id, finder_id, room_id)
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they're part of
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = finder_id);

-- Policy: Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = finder_id OR auth.uid() = owner_id);
```

## Step 2: Create Messages Table

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in conversations they're part of
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.owner_id = auth.uid() OR conversations.finder_id = auth.uid())
    )
  );

-- Policy: Users can send messages in conversations they're part of
CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.owner_id = auth.uid() OR conversations.finder_id = auth.uid())
    )
  );
```

## Step 3: Enable Realtime (Optional but Recommended)

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable replication for `messages` table
3. This enables real-time updates for new messages

## Step 4: Verify Setup

Run these queries to verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages');
```

## Notes

- Conversations are unique per owner-finder-room combination
- Messages are automatically deleted when conversation is deleted
- Only participants in a conversation can read/write messages
- Real-time updates work via Supabase subscriptions

