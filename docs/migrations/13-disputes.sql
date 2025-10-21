-- Disputes Migration
-- This migration creates the disputes table and related indexes

-- Create disputes table
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
    opened_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    dispute_reason TEXT NOT NULL,
    buyer_evidence JSONB DEFAULT '{}',
    seller_evidence JSONB DEFAULT '{}',
    admin_notes TEXT,
    resolution TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    resolved_by UUID REFERENCES public.users(id),
    refund_amount DECIMAL(10,2) DEFAULT 0,
    seller_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Create indexes for disputes
CREATE INDEX idx_disputes_transaction_id ON public.disputes(transaction_id);
CREATE INDEX idx_disputes_opened_by ON public.disputes(opened_by);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_resolved_by ON public.disputes(resolved_by);
CREATE INDEX idx_disputes_created_at ON public.disputes(created_at DESC);

-- Add RLS policies for disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view disputes they're involved in
CREATE POLICY "Users can view their disputes" ON public.disputes
    FOR SELECT USING (
        opened_by = auth.uid() OR 
        transaction_id IN (
            SELECT id FROM public.escrow_transactions 
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- Policy: Users can create disputes for their transactions
CREATE POLICY "Users can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (
        opened_by = auth.uid() AND
        transaction_id IN (
            SELECT id FROM public.escrow_transactions 
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- Policy: Users can update their own disputes (submit evidence)
CREATE POLICY "Users can update their disputes" ON public.disputes
    FOR UPDATE USING (
        opened_by = auth.uid() OR
        transaction_id IN (
            SELECT id FROM public.escrow_transactions 
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );
