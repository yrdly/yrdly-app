-- Update storage buckets to allow HEIC files
-- Run this in your Supabase SQL Editor

-- Update post-images bucket to allow HEIC files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'post-images';

-- Update chat-images bucket to allow HEIC files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'chat-images';

-- Update user-avatars bucket to allow HEIC files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'user-avatars';
