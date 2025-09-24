-- Add RLS policy for inserting notifications
-- This allows users to create notifications for other users (like friend requests)

CREATE POLICY "Users can insert notifications" ON public.notifications 
FOR INSERT WITH CHECK (true);

-- Also ensure the notifications table has RLS enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

