-- Step 1: Add master_admin to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'master_admin';