-- Link Business Reviews to Transactions
-- Add transaction_id and verified_purchase fields to business_reviews table

-- Add new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'business_reviews' AND column_name = 'transaction_id') THEN
        ALTER TABLE business_reviews
        ADD COLUMN transaction_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'business_reviews' AND column_name = 'verified_purchase') THEN
        ALTER TABLE business_reviews
        ADD COLUMN verified_purchase BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create unique index to ensure one review per transaction per user
DROP INDEX IF EXISTS idx_one_review_per_transaction;
CREATE UNIQUE INDEX idx_one_review_per_transaction 
ON business_reviews(transaction_id, user_id) 
WHERE transaction_id IS NOT NULL;

-- Add constraint: if transaction_id exists, verified_purchase must be true
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_verified_purchase'
    ) THEN
        ALTER TABLE business_reviews
        ADD CONSTRAINT check_verified_purchase 
        CHECK (transaction_id IS NULL OR verified_purchase = TRUE);
    END IF;
END $$;

-- Enable RLS on business_reviews if not already enabled
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view business reviews" ON business_reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON business_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON business_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON business_reviews;

-- Anyone can view business reviews
CREATE POLICY "Anyone can view business reviews" ON business_reviews
FOR SELECT USING (true);

-- Authenticated users can insert reviews (additional checks in application layer)
CREATE POLICY "Authenticated users can insert reviews" ON business_reviews
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Users can update their own reviews within 24 hours
CREATE POLICY "Users can update their own reviews" ON business_reviews
FOR UPDATE USING (
  auth.uid() = user_id 
  AND created_at > NOW() - INTERVAL '24 hours'
);

-- Users can delete their own reviews within 24 hours
CREATE POLICY "Users can delete their own reviews" ON business_reviews
FOR DELETE USING (
  auth.uid() = user_id 
  AND created_at > NOW() - INTERVAL '24 hours'
);

-- Create index on business_id for faster queries
CREATE INDEX IF NOT EXISTS idx_business_reviews_business_id 
ON business_reviews(business_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_business_reviews_user_id 
ON business_reviews(user_id);

-- Create index on transaction_id for faster queries
CREATE INDEX IF NOT EXISTS idx_business_reviews_transaction_id 
ON business_reviews(transaction_id);

