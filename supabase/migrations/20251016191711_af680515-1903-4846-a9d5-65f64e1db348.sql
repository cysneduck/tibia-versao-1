-- Add desktop_notifications column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS desktop_notifications BOOLEAN DEFAULT true;