-- Add missing columns to item_chats table
-- These columns are used by the chat service for managing chat data

ALTER TABLE public.item_chats 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.item_chats 
ADD COLUMN IF NOT EXISTS last_message TEXT;

-- Update existing records to have last_message_at = last_activity
UPDATE public.item_chats 
SET last_message_at = last_activity 
WHERE last_message_at IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_item_chats_last_message_at ON public.item_chats(last_message_at DESC);
