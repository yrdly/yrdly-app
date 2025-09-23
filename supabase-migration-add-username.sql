-- Migration: Add username column to users table
-- Run this in your Supabase SQL editor

-- Add username column to existing users table
ALTER TABLE public.users ADD COLUMN username TEXT UNIQUE;

-- Add index for username lookups (optional but recommended for performance)
CREATE INDEX idx_users_username ON public.users(username);

-- Update RLS policies to allow username access
-- (The existing policies should already cover this, but let's make sure)

-- Note: If you have existing users, you might want to populate usernames
-- UPDATE public.users SET username = LOWER(REPLACE(name, ' ', '_')) || '_' || EXTRACT(EPOCH FROM created_at)::bigint WHERE username IS NULL;
