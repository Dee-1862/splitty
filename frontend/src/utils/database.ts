import { supabase } from '../supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  goal_calories: number;
  goal_protein: number;
  goal_carbs: number;
  goal_fats: number;
  allergies: string;
  // New fields for BMI and hydration
  weight?: number; // kg
  height?: number; // cm
  goal_water?: number; // ml per day
  created_at: string;
  updated_at: string;
}

export interface WaterIntake {
  id: string;
  user_id: string;
  amount_ml: number;
  date: string;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  image_url: string;
  food_items: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  carbon_kg: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fats_per_serving: number;
  carbon_per_serving: number;
  image_url: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance';
  target_weight: number;
  current_weight: number;
  target_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Profile operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  console.log('updateProfile called with:', { userId, updates });
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating profile:', error);
  }

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
};

// Meal operations
export const getMeals = async (userId: string, date?: string): Promise<Meal[]> => {
  let query = supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching meals:', error);
    return [];
  }

  return data || [];
};

// export const addMeal = async (meal: Omit<Meal, 'id' | 'created_at' | 'updated_at'>): Promise<Meal | null> => {
//   const { data, error } = await supabase
//     .from('meals')
//     .insert(meal)
//     .select()
//     .single();

//   if (error) {
//     console.error('Error adding meal:', error);
//     return null;
//   }

//   return data;
// };

export type NewMeal = {
  user_id: string;
  meal_type: string;
  food_items: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  carbon_kg: number;
  image_url?: string; // Added this field (make it optional)
  date: string;       // Added this field
};

export const addMeal = async (meal: NewMeal) => {
  console.log('Attempting to add meal:', meal);
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('No authenticated session found');
    throw new Error('User not authenticated');
  }
  
  console.log('User authenticated:', session.user.id);
  
  // Assuming your table is named 'meals'
  const { data, error } = await supabase
    .from('meals')
    .insert([meal]) // This will now insert all fields, including date and image_url
    .select();

  if (error) {
    console.error('Error adding meal:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to add meal: ${error.message}`);
  }

  console.log('Meal added successfully:', data);
  return data;
};

export const updateMeal = async (mealId: string, updates: Partial<Meal>): Promise<Meal | null> => {
  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', mealId)
    .select()
    .single();

  if (error) {
    console.error('Error updating meal:', error);
    return null;
  }

  return data;
};

export const deleteMeal = async (mealId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId);

  if (error) {
    console.error('Error deleting meal:', error);
    return false;
  }

  return true;
};

// Recipe operations
export const getRecipes = async (userId: string): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }

  return data || [];
};

export const addRecipe = async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe | null> => {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single();

  if (error) {
    console.error('Error adding recipe:', error);
    return null;
  }

  return data;
};

export const deleteRecipe = async (recipeId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId);

  if (error) {
    console.error('Error deleting recipe:', error);
    return false;
  }

  return true;
};

// User goals operations
export const getUserGoals = async (userId: string): Promise<UserGoal[]> => {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user goals:', error);
    return [];
  }

  return data || [];
};

export const addUserGoal = async (goal: Omit<UserGoal, 'id' | 'created_at' | 'updated_at'>): Promise<UserGoal | null> => {
  const { data, error } = await supabase
    .from('user_goals')
    .insert(goal)
    .select()
    .single();

  if (error) {
    console.error('Error adding user goal:', error);
    return null;
  }

  return data;
};

export const updateUserGoal = async (goalId: string, updates: Partial<UserGoal>): Promise<UserGoal | null> => {
  const { data, error } = await supabase
    .from('user_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user goal:', error);
    return null;
  }

  return data;
};

// Analytics calculations
export const calculateDayStreak = (meals: Meal[]): number => {
  if (meals.length === 0) return 0;
  
  const dates = [...new Set(meals.map(meal => meal.date))].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < dates.length; i++) {
    // const currentDate = new Date(dates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    
    if (dates[i] === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateTotalCarbonSaved = (meals: Meal[]): number => {
  return meals.reduce((total, meal) => total + (meal.carbon_kg || 0), 0);
};

export const calculateWeeklyAverageCalories = (meals: Meal[]): number => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  const recentMeals = meals.filter(meal => meal.date >= sevenDaysAgoStr);
  if (recentMeals.length === 0) return 0;
  
  const totalCalories = recentMeals.reduce((total, meal) => total + (meal.calories || 0), 0);
  return Math.round(totalCalories / 7);
};

export const calculateAverageProtein = (meals: Meal[]): number => {
  if (meals.length === 0) return 0;
  
  const totalProtein = meals.reduce((total, meal) => total + (meal.protein_g || 0), 0);
  return Math.round(totalProtein / meals.length);
};

// Daily stats calculation
export const calculateDailyStats = (meals: Meal[], goals: Partial<Profile> = {}) => {
  const totals = meals.reduce((acc, meal) => ({
    total_calories: acc.total_calories + (meal.calories || 0),
    total_protein: acc.total_protein + (meal.protein_g || 0),
    total_carbs: acc.total_carbs + (meal.carbs_g || 0),
    total_fats: acc.total_fats + (meal.fats_g || 0),
    total_carbon: acc.total_carbon + (meal.carbon_kg || 0),
  }), {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    total_carbon: 0,
  });

  return {
    ...totals,
    goal_calories: goals.goal_calories || 2000,
    goal_protein: goals.goal_protein || 150,
    goal_carbs: goals.goal_carbs || 250,
    goal_fats: goals.goal_fats || 67,
  };
};

// Water/Hydration tracking functions
export const addWaterIntake = async (userId: string, amount_ml: number): Promise<WaterIntake | null> => {
  const today = new Date().toISOString().split('T')[0];
  console.log('addWaterIntake called:', { userId, amount_ml, date: today });
  
  // First, check if there's already an entry for today
  const { data: existingData, error: selectError } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today);

  // Handle error (but not 404 - that's expected if no entry exists)
  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error checking existing water intake:', selectError);
    return null;
  }

  // Check if we got any results
  const existing = existingData && existingData.length > 0 ? existingData[0] : null;
  console.log('Existing water intake:', existing);

  if (existing) {
    // Update existing entry
    const { data, error } = await supabase
      .from('water_intake')
      .update({ amount_ml: existing.amount_ml + amount_ml })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating water intake:', error);
      return null;
    }
    console.log('Updated water intake:', data);
    return data;
  } else {
    // Create new entry
    const { data, error } = await supabase
      .from('water_intake')
      .insert({
        user_id: userId,
        amount_ml,
        date: today
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding water intake:', error);
      return null;
    }
    console.log('Created water intake:', data);
    return data;
  }
};

export const getWaterIntake = async (userId: string, date?: string): Promise<number> => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('water_intake')
    .select('amount_ml')
    .eq('user_id', userId)
    .eq('date', targetDate);

  // Handle case where no rows exist (404 error is expected)
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching water intake:', error);
    return 0;
  }

  // If no data or empty array, return 0
  if (!data || data.length === 0) {
    return 0;
  }

  return data[0].amount_ml || 0;
};

// BMI calculation function
export const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height || height === 0) return 0;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

// Get BMI category
export const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi === 0) return { label: 'N/A', color: 'text-gray-500' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-500' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' };
  return { label: 'Obese', color: 'text-red-500' };
};
