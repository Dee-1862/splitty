-- Add allergies field to profiles table
-- Run this in your Supabase SQL Editor

-- Add allergies field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '';

-- Update the updated_at timestamp
UPDATE public.profiles SET updated_at = NOW() WHERE allergies IS NULL;

-- Add a comment to document the field
COMMENT ON COLUMN public.profiles.allergies IS 'Comma-separated list of food allergies and dietary restrictions';
