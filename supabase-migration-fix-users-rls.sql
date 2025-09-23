-- Fix RLS policy for users table to allow reading other users' data
-- This is needed for the neighbors page to work

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- Create a new policy that allows users to read all users' data
-- (but they can only update their own data)
CREATE POLICY "Users can read all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Optional: If you want to be more restrictive, you can use this instead:
-- CREATE POLICY "Users can read other users" ON public.users FOR SELECT USING (auth.uid() IS NOT NULL);
