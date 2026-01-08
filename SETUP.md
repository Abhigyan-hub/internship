# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. Fill in project details and wait for setup (2-3 minutes)

## Step 3: Create Database Table

In Supabase Dashboard → SQL Editor, run:

**Note:** If you already have a rooms table without the description column, run the migration script in `database_migration.sql` first.

```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  rent_price INTEGER NOT NULL,
  property_type TEXT NOT NULL,
  tenant_preference TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  description TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Users can insert their own rooms" ON rooms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own rooms" ON rooms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own rooms" ON rooms FOR DELETE USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Click "New bucket"
3. Name: `room-images`
4. Make it **Public** (uncheck Private)
5. Click "Create bucket"

## Step 5: Set Storage Policies

In Storage → Policies for `room-images`:

```sql
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'room-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 6: Get API Keys

1. Go to Settings → API
2. Copy:
   - Project URL
   - anon/public key

## Step 7: Create .env.local

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pdfoyllthbwepfzozniz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AkC35WVnG4vsKce7QvR-Yw_I2Q84F2-
```

## Step 8: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 9: Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com
3. Import repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Troubleshooting

- **Images not showing?** Check storage bucket is public and policies are set
- **Can't add rooms?** Check RLS policies are correct
- **Auth not working?** Verify API keys in .env.local

