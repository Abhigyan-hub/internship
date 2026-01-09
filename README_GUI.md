# Supabase Admin GUI - Python Application

A Python GUI application to perform CRUD (Create, Read, Update, Delete) operations on the Supabase rooms database.

## Features

- ✅ Connect to Supabase database
- ✅ View all rooms in a table
- ✅ Create new room listings
- ✅ Update existing room listings
- ✅ Delete room listings
- ✅ User-friendly interface with form validation

## Prerequisites

- Python 3.7 or higher
- Supabase account and project
- Supabase URL and API key

## Installation

1. Install required packages:
```bash
pip install -r requirements_gui.txt
```

Or install manually:
```bash
pip install supabase python-dotenv
```

## Usage

### Option 1: Run with GUI (Enter credentials manually)

```bash
python supabase_admin_gui.py
```

1. Enter your Supabase URL (e.g., `https://your-project.supabase.co`)
2. Enter your Supabase anon key (found in Supabase Dashboard → Settings → API)
3. Click "Connect"
4. Start performing CRUD operations!

### Option 2: Use Environment Variables

Create a `.env` file in the same directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

Then run:
```bash
python supabase_admin_gui.py
```

The fields will be pre-filled with your environment variables.

## How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `SUPABASE_URL`
   - **anon/public key** → Use for `SUPABASE_KEY`

## Features Explained

### View Rooms
- All rooms are displayed in a table on the left
- Click on any room to load its details in the form

### Create Room
1. Fill in all required fields (marked with *)
2. Click "➕ Create"
3. The room will be added to the database

### Update Room
1. Select a room from the list
2. Modify the fields as needed
3. Click "✏️ Update"
4. Changes will be saved to the database

### Delete Room
1. Select a room from the list
2. Click "🗑️ Delete"
3. Confirm the deletion
4. The room will be removed from the database

### Clear Form
- Click "🔄 Clear Form" to reset all fields and start fresh

## Required Fields

- **Title**: Room listing title
- **Location**: Room location/address
- **Rent Price**: Monthly rent (number)
- **Property Type**: 1 BHK, 2 BHK, 1 Bed, 2 Bed, or 3 Bed
- **Tenant Preference**: Bachelor, Family, Girls, or Working
- **Contact Number**: Owner's contact number
- **Owner ID**: Supabase user ID of the room owner
- **Description**: Optional room description

## Notes

- The application uses the Supabase Python client library
- All operations are performed directly on your Supabase database
- Make sure you have the correct permissions set in Supabase RLS policies
- The GUI uses tkinter (included with Python)

## Troubleshooting

**Connection Error:**
- Verify your Supabase URL and key are correct
- Check your internet connection
- Ensure your Supabase project is active

**Permission Errors:**
- Check your Supabase Row Level Security (RLS) policies
- You may need to use a service role key instead of anon key for admin operations

**Import Errors:**
- Make sure you've installed all requirements: `pip install -r requirements_gui.txt`

