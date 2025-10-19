-- Add activity tracking fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient online status queries
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Update existing users to have a last_seen timestamp
UPDATE users 
SET last_seen = COALESCE(created_at, NOW()) 
WHERE last_seen IS NULL;
