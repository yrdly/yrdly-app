-- Marketplace Transactions Migration
-- This migration adds payment fields to escrow_transactions table

-- Add payment-related fields to escrow_transactions
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'flutterwave',
ADD COLUMN IF NOT EXISTS flutterwave_tx_ref TEXT;

-- Create index for payment reference lookups
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_payment_ref ON public.escrow_transactions(payment_reference);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_flutterwave_ref ON public.escrow_transactions(flutterwave_tx_ref);

-- Add seller subaccount tracking
ALTER TABLE public.seller_accounts 
ADD COLUMN IF NOT EXISTS flutterwave_subaccount_id TEXT,
ADD COLUMN IF NOT EXISTS payout_enabled BOOLEAN DEFAULT false;

-- Create index for subaccount lookups
CREATE INDEX IF NOT EXISTS idx_seller_accounts_subaccount_id ON public.seller_accounts(flutterwave_subaccount_id);
