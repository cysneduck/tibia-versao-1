-- Add INSERT policy for notifications table to allow edge functions to create notifications
-- This allows admins to insert test notifications via the test-notification edge function
CREATE POLICY "Admins can insert notifications for testing"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin')
  )
);