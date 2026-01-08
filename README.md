# 🏠 Room Finder Website

A modern web application for finding and listing rental rooms, built with Next.js, TypeScript, and Supabase.

## Features

### For Room Finders (Users)
- 🔍 Search rooms by location (highest priority)
- 💰 Filter by price range
- 🏘️ Filter by property type (1 BHK, 2 BHK, 1/2/3 Bed)
- 👥 Filter by tenant preference (Bachelor, Family, Girls, Working)
- 📱 Responsive design for mobile and desktop
- 📞 Direct contact information display

### For Room Owners
- ➕ Add new room listings
- 📸 Upload multiple room images
- ✏️ Edit existing listings
- 🗑️ Delete listings
- 👀 View all your listings in one place

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase
  - Authentication (Email/OTP)
  - PostgreSQL Database
  - Storage for images

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be fully set up (takes a few minutes)

### 3. Create Database Table

In your Supabase project, go to **SQL Editor** and run the following SQL:

```sql
-- Create rooms table
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

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read rooms
CREATE POLICY "Anyone can view rooms" ON rooms
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own rooms
CREATE POLICY "Users can insert their own rooms" ON rooms
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own rooms
CREATE POLICY "Users can update their own rooms" ON rooms
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Allow users to delete their own rooms
CREATE POLICY "Users can delete their own rooms" ON rooms
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create updated_at trigger
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

### 4. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it: `room-images`
4. Make it **Public** (uncheck "Private bucket")
5. Click **Create bucket**

### 5. Set Up Storage Policies

In **Storage** → **Policies** for the `room-images` bucket, add these policies:

```sql
-- Allow anyone to read images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'room-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'room-images' AND auth.role() = 'authenticated');

-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 6. Configure Environment Variables

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variables in Site settings
7. Deploy!

## Project Structure

```
room-finder/
├── app/
│   ├── auth/          # Authentication page
│   ├── add-room/      # Add room page (owners)
│   ├── my-rooms/      # Manage rooms page (owners)
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page (room finder)
│   └── globals.css    # Global styles
├── components/
│   ├── AuthProvider.tsx   # Auth context
│   ├── Navbar.tsx        # Navigation bar
│   ├── RoomCard.tsx      # Room card component
│   ├── RoomList.tsx      # Room list component
│   └── SearchFilters.tsx # Search filters
├── lib/
│   └── supabase.ts    # Supabase client
└── public/            # Static assets
```

## Database Schema

### rooms table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Room title |
| location | TEXT | Room location |
| rent_price | INTEGER | Monthly rent in ₹ |
| property_type | TEXT | 1 BHK, 2 BHK, 1/2/3 Bed |
| tenant_preference | TEXT | Bachelor, Family, Girls, Working |
| contact_number | TEXT | Owner contact |
| description | TEXT | Room description and details |
| owner_id | UUID | Foreign key to auth.users |
| images | TEXT[] | Array of image paths |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Features Implementation

✅ User authentication (Email/OTP)  
✅ Role-based access (Room Owner vs Room Finder)  
✅ Room search with filters  
✅ Location-based search (highest priority)  
✅ Price range filtering  
✅ Property type filtering  
✅ Tenant preference filtering  
✅ Room listing display with image slideshow  
✅ Add room functionality  
✅ Multiple image upload  
✅ Edit room functionality  
✅ Delete room functionality  
✅ View own rooms  
✅ Responsive design  
✅ Clean and professional UI  

## Notes

- The application uses Supabase Row Level Security (RLS) for data protection
- Images are stored in Supabase Storage
- Authentication is handled via Supabase Auth
- The app is fully responsive and works on mobile and desktop

## Support

For issues or questions, please refer to the Supabase documentation or Next.js documentation.

