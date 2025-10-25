import { supabase } from '../supabase';

export async function checkDatabaseSchema() {
  console.log('Checking database schema...');
  
  try {
    // Check if tables exist and have correct structure
    const tables = ['profiles', 'meals', 'recipes', 'user_goals'];
    const results: Record<string, any> = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        results[table] = {
          exists: !error,
          error: error?.message,
          hasData: data && data.length > 0
        };
        
        console.log(`Table ${table}:`, results[table]);
      } catch (err) {
        results[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        };
        console.error(`Error checking table ${table}:`, err);
      }
    }
    
    // Test specific column types for meals table
    if (results.meals.exists) {
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('food_items')
          .limit(1);
        
        if (!error && data) {
          console.log('food_items column test:', {
            type: typeof data[0]?.food_items,
            isArray: Array.isArray(data[0]?.food_items),
            sample: data[0]?.food_items
          });
        }
      } catch (err) {
        console.error('Error testing food_items column:', err);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Schema check failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
