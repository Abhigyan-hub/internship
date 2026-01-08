-- Migration: Add description column to rooms table
-- Run this in your Supabase SQL Editor

-- Add description column to existing rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS description TEXT;

-- If you want to make it required for new entries but allow existing ones to be null temporarily:
-- You can update existing rows to have a default description if needed:
-- UPDATE rooms SET description = 'No description provided' WHERE description IS NULL;

-- If you want to make it NOT NULL (required), first update existing rows, then:
-- ALTER TABLE rooms ALTER COLUMN description SET NOT NULL;

