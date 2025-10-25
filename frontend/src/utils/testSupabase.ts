import { supabase } from '../supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session test:', { session: !!session, error: sessionError });
    
    // Test 2: Check if we can access the profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    console.log('Profiles table test:', { data: profiles, error: profilesError });
    
    // Test 3: Check if we can access the meals table
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('count')
      .limit(1);
    console.log('Meals table test:', { data: meals, error: mealsError });
    
    // Test 4: Check if we can access the user_goals table
    const { data: goals, error: goalsError } = await supabase
      .from('user_goals')
      .select('count')
      .limit(1);
    console.log('User goals table test:', { data: goals, error: goalsError });
    
    return {
      success: true,
      session: !!session,
      tables: {
        profiles: !profilesError,
        meals: !mealsError,
        user_goals: !goalsError
      }
    };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
