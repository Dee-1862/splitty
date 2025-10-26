-- Fix Recipes Table - Run this in Supabase SQL Editor
-- This will create the recipes table and fix the 400 error

-- 1. Create recipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}', -- Array of ingredients
  instructions TEXT[] NOT NULL DEFAULT '{}', -- Array of instructions
  prep_time INTEGER DEFAULT 0, -- in minutes
  cook_time INTEGER DEFAULT 0, -- in minutes
  servings INTEGER DEFAULT 1,
  calories_per_serving INTEGER DEFAULT 0,
  protein_per_serving DECIMAL(5,2) DEFAULT 0,
  carbs_per_serving DECIMAL(5,2) DEFAULT 0,
  fats_per_serving DECIMAL(5,2) DEFAULT 0,
  carbon_per_serving DECIMAL(5,3) DEFAULT 0,
  image_url TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on recipes table
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;
CREATE POLICY "Users can view own recipes" ON public.recipes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recipes" ON public.recipes;
CREATE POLICY "Users can insert own recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recipes" ON public.recipes;
CREATE POLICY "Users can update own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recipes" ON public.recipes;
CREATE POLICY "Users can delete own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);

-- 5. Add allergies field to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '';

-- 6. Update the updated_at timestamp for profiles
UPDATE public.profiles SET updated_at = NOW() WHERE allergies IS NULL;

-- 7. Add a comment to document the allergies field
COMMENT ON COLUMN public.profiles.allergies IS 'Comma-separated list of food allergies and dietary restrictions';
