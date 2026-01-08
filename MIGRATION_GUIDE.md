# Database Migration Guide

## Adding Description Column to Existing Rooms Table

If you're getting an error that the `description` column doesn't exist, you need to add it to your existing database.

### Quick Fix

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Add description column to existing rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS description TEXT;
```

### For New Installations

If you're setting up a fresh database, the `description` column is already included in the CREATE TABLE statement in `SETUP.md` and `README.md`.

### Making Description Required (Optional)

If you want to make the description field required for all rooms:

```sql
-- First, update any existing NULL values
UPDATE rooms 
SET description = 'No description provided' 
WHERE description IS NULL;

-- Then make it required
ALTER TABLE rooms 
ALTER COLUMN description SET NOT NULL;
```

### Verify the Column Was Added

You can verify the column exists by running:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rooms' AND column_name = 'description';
```

This should return a row showing the description column with data_type 'text'.

