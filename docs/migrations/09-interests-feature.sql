-- Interests Feature Migration
-- This migration adds interests functionality to the users table

-- Add interests column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Create an index for interests for better query performance
CREATE INDEX IF NOT EXISTS idx_users_interests ON public.users USING GIN (interests);

-- Add comment to document the interests column
COMMENT ON COLUMN public.users.interests IS 'Array of user interests/tags for profile display and matching';
