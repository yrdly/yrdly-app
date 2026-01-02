-- Location-Based Filtering Migration
-- This migration adds state/lga/ward columns and RLS policies for location-based content visibility

-- Add location columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS lga TEXT,
ADD COLUMN IF NOT EXISTS ward TEXT;

-- Add location columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS lga TEXT,
ADD COLUMN IF NOT EXISTS ward TEXT;

-- Create indexes for state filtering
CREATE INDEX IF NOT EXISTS idx_posts_state ON public.posts(state) WHERE state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_state_category ON public.posts(state, category) WHERE state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_state ON public.businesses(state) WHERE state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_state_category ON public.businesses(state, category) WHERE state IS NOT NULL;

-- Drop existing posts SELECT policy to replace with location-based policy
DROP POLICY IF EXISTS "Posts are readable by everyone" ON public.posts;

-- Create new location-based RLS policy for posts
-- Users can see:
-- 1. Posts from their own state
-- 2. Their own posts regardless of state
-- 3. Grandfathered posts (state IS NULL)
CREATE POLICY "Users see content from their state" ON public.posts
  FOR SELECT USING (
    (posts.state = (SELECT location->>'state' FROM public.users WHERE id = auth.uid()))
    OR (posts.user_id = auth.uid())  -- Users always see their own content
    OR (posts.state IS NULL)  -- Grandfathered content
  );

-- Drop existing businesses SELECT policy to replace with location-based policy
DROP POLICY IF EXISTS "Users can view all businesses" ON public.businesses;

-- Create new location-based RLS policy for businesses
-- Users can see:
-- 1. Businesses from their own state
-- 2. Their own businesses regardless of state
-- 3. Grandfathered businesses (state IS NULL)
CREATE POLICY "Users see businesses from their state" ON public.businesses
  FOR SELECT USING (
    (businesses.state = (SELECT location->>'state' FROM public.users WHERE id = auth.uid()))
    OR (businesses.owner_id = auth.uid())  -- Users always see their own businesses
    OR (businesses.state IS NULL)  -- Grandfathered content
  );

-- Add comment to document the new columns
COMMENT ON COLUMN public.posts.state IS 'State where the post was created. Required for new posts. NULL values are grandfathered.';
COMMENT ON COLUMN public.posts.lga IS 'Local Government Area (optional)';
COMMENT ON COLUMN public.posts.ward IS 'Ward (optional)';
COMMENT ON COLUMN public.businesses.state IS 'State where the business is located. Required for new businesses. NULL values are grandfathered.';
COMMENT ON COLUMN public.businesses.lga IS 'Local Government Area (optional)';
COMMENT ON COLUMN public.businesses.ward IS 'Ward (optional)';

