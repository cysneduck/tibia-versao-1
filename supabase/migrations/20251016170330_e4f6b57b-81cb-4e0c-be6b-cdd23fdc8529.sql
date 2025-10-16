-- Add onboarding tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT TRUE;

-- Set existing users as having completed onboarding
UPDATE public.profiles 
SET onboarding_completed = TRUE, 
    password_changed = TRUE, 
    first_login = FALSE 
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;