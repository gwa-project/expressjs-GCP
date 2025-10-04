-- Add image and description columns to posters table
ALTER TABLE posters ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE posters ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
