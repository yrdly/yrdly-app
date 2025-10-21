-- Item Tracking Migration
-- This migration adds sold status fields to posts table

-- Add sold status fields to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sold_to_user_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES public.escrow_transactions(id);

-- Create indexes for sold item queries
CREATE INDEX IF NOT EXISTS idx_posts_is_sold ON public.posts(is_sold);
CREATE INDEX IF NOT EXISTS idx_posts_sold_to_user_id ON public.posts(sold_to_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_transaction_id ON public.posts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_posts_sold_at ON public.posts(sold_at);

-- Add constraint to ensure sold items have required fields
ALTER TABLE public.posts 
ADD CONSTRAINT chk_sold_item_fields 
CHECK (
  (is_sold = false) OR 
  (is_sold = true AND sold_to_user_id IS NOT NULL AND sold_at IS NOT NULL AND transaction_id IS NOT NULL)
);
