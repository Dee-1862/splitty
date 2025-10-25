# MindMeal - Comprehensive Nutrition Tracking App

A React-based nutrition tracking application built for HackPSU, featuring meal tracking, carbon footprint calculation, and AI-powered recipe generation.

## Features

- **Dashboard**: Track daily nutrition with real-time progress visualization
- **Cookbook**: AI-powered recipe generation from ingredient photos
- **Profile**: User analytics, goal tracking, and meal history
- **Carbon Footprint Tracking**: Calculate and reduce environmental impact
- **Macro Tracking**: Monitor protein, carbs, and fats
- **Authentication**: Secure user authentication with Supabase

## Tech Stack

- **Frontend**: React 18 + Vite, TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Notifications**: React Toastify
- **Routing**: React Router DOM v7
- **Backend**: Supabase (PostgreSQL + Auth + Storage)

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend` directory with your credentials:

```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Optional - for future AI features
VITE_GOOGLE_VISION_API_KEY="your_google_vision_key"
VITE_OPENAI_API_KEY="your_openai_key"
VITE_NUTRITIONIX_APP_ID="your_nutritionix_app_id"
VITE_NUTRITIONIX_API_KEY="your_nutritionix_api_key"
```

### 3. Database Setup

Run the following SQL in your Supabase SQL Editor to create the necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  weight_kg DECIMAL(5,2) NOT NULL,
  height_cm DECIMAL(5,2) NOT NULL,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  goal TEXT NOT NULL CHECK (goal IN ('lose_weight', 'maintain', 'gain_muscle', 'improve_health')),
  dietary_restrictions TEXT[],
  allergies TEXT[],
  budget_per_meal DECIMAL(6,2),
  bmr INTEGER,
  tdee INTEGER,
  daily_calories INTEGER,
  macro_protein_g INTEGER,
  macro_carbs_g INTEGER,
  macro_fats_g INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEALS table
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url TEXT NOT NULL,
  food_items TEXT[] NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fats_g DECIMAL(6,2),
  fiber_g DECIMAL(6,2),
  sugar_g DECIMAL(6,2),
  sodium_mg DECIMAL(6,2),
  carbon_kg DECIMAL(6,3),
  ai_suggestions TEXT,
  sustainable_alternatives JSONB,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SAVED_RECIPES table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('assemble', 'cook')),
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  nutrition JSONB,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type TEXT,
  carbon_kg DECIMAL(6,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_STATS table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_protein_g DECIMAL(6,2) DEFAULT 0,
  total_carbs_g DECIMAL(6,2) DEFAULT 0,
  total_fats_g DECIMAL(6,2) DEFAULT 0,
  total_carbon_kg DECIMAL(6,3) DEFAULT 0,
  meals_logged INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  goal_achieved BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_date ON user_stats(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for meals
CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_recipes
CREATE POLICY "Users can view own recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `meal-images` with public access
3. Run the following SQL to set up storage policies:

```sql
-- Storage policies for meal-images bucket
CREATE POLICY "Users can upload own meal images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view meal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-images');

CREATE POLICY "Users can delete own meal images"
ON storage.objects FOR DELETE
USING (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Login and Register components
│   │   ├── layout/         # Navigation and layout components
│   │   ├── views/          # Dashboard, Cookbook, Profile pages
│   │   └── common/         # Reusable components
│   ├── utils/              # Utility functions (calculations, carbon data, constants)
│   ├── supabase.ts         # Supabase client configuration
│   ├── AuthContext.tsx     # Authentication context
│   ├── routes.ts           # React Router configuration
│   └── main.tsx            # Application entry point
```

## Features Breakdown

### Dashboard
- Real-time calorie tracking with progress visualization
- Macro breakdown (protein, carbs, fats)
- Carbon footprint tracking
- Daily meal logging
- Goal progress indicators

### Cookbook
- AI-powered recipe generation
- Two modes: Assemble (no-cook) and Cook (with cooking instructions)
- Image-based ingredient detection (planned)
- Recipe saving and history

### Profile
- User statistics and streak tracking
- Goal management
- Dietary preferences and allergies
- Settings and preferences
- Meal history calendar

## Future Enhancements

- [ ] Integrate Google Cloud Vision API for food recognition
- [ ] Implement OpenAI GPT-4 for recipe generation
- [ ] Add Nutritionix API for accurate nutritional data
- [ ] Camera functionality for meal photo capture
- [ ] Advanced analytics with charts and graphs
- [ ] Social features and meal sharing
- [ ] Meal planning and grocery list generation
- [ ] Export data functionality

## License

MIT License - feel free to use this project for HackPSU!

## Contributors

Built for HackPSU 2024
