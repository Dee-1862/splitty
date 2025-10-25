import { supabase } from '../supabase';

// Test database connection and table relationships
export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return false;
    }
    
    if (!user) {
      console.log('⚠️ No authenticated user found');
      return false;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Test 2: Check if profile exists (should be created automatically)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log('⚠️ Profile not found, creating one...');
      
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          goal_calories: 2000,
          goal_protein: 150,
          goal_carbs: 250,
          goal_fats: 67
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return false;
      }
      
      console.log('✅ Profile created:', newProfile);
    } else {
      console.log('✅ Profile found:', profile);
    }
    
    // Test 3: Test meals table connection
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);
    
    if (mealsError) {
      console.error('❌ Meals table error:', mealsError);
      return false;
    }
    
    console.log('✅ Meals table accessible, found', meals?.length || 0, 'meals');
    
    // Test 4: Test recipes table connection
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);
    
    if (recipesError) {
      console.error('❌ Recipes table error:', recipesError);
      return false;
    }
    
    console.log('✅ Recipes table accessible, found', recipes?.length || 0, 'recipes');
    
    // Test 5: Test user_goals table connection
    const { data: goals, error: goalsError } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);
    
    if (goalsError) {
      console.error('❌ User goals table error:', goalsError);
      return false;
    }
    
    console.log('✅ User goals table accessible, found', goals?.length || 0, 'goals');
    
    console.log('🎉 All database connections successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

// Test adding a sample meal to verify the connection works
export const testAddMeal = async (userId: string) => {
  console.log('🍽️ Testing meal addition...');
  
  try {
    const testMeal = {
      user_id: userId,
      meal_type: 'breakfast' as const,
      food_items: ['Test Toast', 'Test Coffee'],
      calories: 300,
      protein_g: 8.5,
      carbs_g: 45.2,
      fats_g: 12.1,
      carbon_kg: 0.5,
      date: new Date().toISOString().split('T')[0],
      image_url: 'https://via.placeholder.com/300'
    };
    
    const { data, error } = await supabase
      .from('meals')
      .insert(testMeal)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error adding test meal:', error);
      return false;
    }
    
    console.log('✅ Test meal added successfully:', data);
    
    // Clean up - delete the test meal
    await supabase
      .from('meals')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Test meal cleaned up');
    return true;
    
  } catch (error) {
    console.error('❌ Test meal addition failed:', error);
    return false;
  }
};
