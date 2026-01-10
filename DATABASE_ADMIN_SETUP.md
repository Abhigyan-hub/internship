# Admin Panel Database Setup

This guide explains how to set up the database tables for the admin panel functionality.

## Step 1: Create Admins Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Add initial admin (fakysinghyo@gmail.com)
INSERT INTO admins (email)
VALUES ('fakysinghyo@gmail.com')
ON CONFLICT (email) DO NOTHING;
```

## Step 2: Set Row Level Security (RLS) Policies

The admins table should be readable by authenticated users (to check admin status), but only admins can insert/update/delete:

```sql
-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read (to check if they're admin)
CREATE POLICY "Anyone can read admins"
ON admins
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only admins can insert new admins
-- Note: This is a simplified approach. In production, you'd want to use a function
-- that checks if the current user is an admin using auth.jwt() or similar
CREATE POLICY "Admins can insert admins"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (true); -- In production, add proper check: (SELECT email FROM admins WHERE email = auth.email()) IS NOT NULL

-- Policy: Only admins can update admins
CREATE POLICY "Admins can update admins"
ON admins
FOR UPDATE
TO authenticated
USING (true); -- In production, add proper check

-- Policy: Only admins can delete admins
CREATE POLICY "Admins can delete admins"
ON admins
FOR DELETE
TO authenticated
USING (true); -- In production, add proper check
```

## Important Notes

### Security Consideration

The RLS policies above use `WITH CHECK (true)` and `USING (true)` for simplicity. **In production**, you should implement proper checks to ensure only existing admins can manage the admins table.

### Better Production Approach

For better security, create a function that checks if the current user is an admin:

```sql
-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get current user's email from auth metadata
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if email is in admins table
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE email = LOWER(user_email)
  ) OR LOWER(user_email) = 'fakysinghyo@gmail.com';
END;
$$;

-- Then update policies:
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
CREATE POLICY "Admins can insert admins"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update admins" ON admins;
CREATE POLICY "Admins can update admins"
ON admins
FOR UPDATE
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete admins" ON admins;
CREATE POLICY "Admins can delete admins"
ON admins
FOR DELETE
TO authenticated
USING (is_admin());
```

## Step 3: Verify Setup

After running the SQL:

1. Check that the `admins` table exists
2. Verify that `fakysinghyo@gmail.com` is in the table
3. Test logging in with that email - you should see the Admin Panel link in the navigation

## Adding/Removing Admins

Admins can manage other admins through the Admin Panel at `/admin` in the "Admins" tab. The initial admin (`fakysinghyo@gmail.com`) cannot be removed for safety.

## Troubleshooting

- **Can't see Admin Panel**: Make sure you're logged in with `fakysinghyo@gmail.com` and the admins table has been created
- **Permission denied**: Check that RLS policies are correctly set up
- **Table doesn't exist**: Run the CREATE TABLE SQL from Step 1
