-- Fix RLS policy for conversations table
-- The current policy expects text but participant_ids contains UUIDs

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create a new policy that works with UUIDs
CREATE POLICY "Users can create conversations" ON public.conversations 
FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids::uuid[]));

-- Also fix the read policy to be consistent
DROP POLICY IF EXISTS "Users can read own conversations" ON public.conversations;

CREATE POLICY "Users can read own conversations" ON public.conversations 
FOR SELECT USING (auth.uid() = ANY(participant_ids::uuid[]));

