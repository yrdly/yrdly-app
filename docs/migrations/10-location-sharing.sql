-- Location Sharing Feature Migration
-- This migration adds location sharing functionality for friends

-- Add location sharing fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_location JSONB; -- { lat, lng, address, last_updated }
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

-- Add comment to document the new columns
COMMENT ON COLUMN public.users.share_location IS 'Whether the user wants to share their location with friends';
COMMENT ON COLUMN public.users.current_location IS 'Current location coordinates and address information';
COMMENT ON COLUMN public.users.location_updated_at IS 'When the location was last updated';

-- Create an index for location queries
CREATE INDEX IF NOT EXISTS idx_users_location_sharing ON public.users(share_location, location_updated_at) WHERE share_location = true;

-- Create a function to update user location
CREATE OR REPLACE FUNCTION update_user_location(
  user_id UUID,
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users 
  SET 
    current_location = jsonb_build_object(
      'lat', latitude,
      'lng', longitude,
      'address', address,
      'last_updated', NOW()
    ),
    location_updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get friends locations
CREATE OR REPLACE FUNCTION get_friends_locations(user_id UUID)
RETURNS TABLE (
  friend_id UUID,
  friend_name TEXT,
  friend_avatar_url TEXT,
  location JSONB,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.avatar_url,
    u.current_location,
    u.location_updated_at
  FROM public.users u
  WHERE 
    u.id = ANY(
      SELECT unnest(friends) 
      FROM public.users 
      WHERE id = user_id
    )
    AND u.share_location = true
    AND u.current_location IS NOT NULL
    AND u.location_updated_at > NOW() - INTERVAL '24 hours'; -- Only show locations updated in last 24 hours
END;
$$ LANGUAGE plpgsql;
