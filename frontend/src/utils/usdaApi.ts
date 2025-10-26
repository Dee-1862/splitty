// USDA FoodData Central API Service
// Get your free API key from: https://fdc.nal.usda.gov/api-key-signup.html

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;
console.log('VITE_USDA_API_KEY from env:', USDA_API_KEY);
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// --- REPLACE WITH THIS ---
export interface USDANutrient {
  type: "FoodNutrient";
  nutrient: {
    id: number;
    number: string;
    name: string;
    rank: number;
    unitName: string;
  };
  id: number; // The ID of the FoodNutrient link
  amount: number; // This is the VALUE of the nutrient
  foodNutrientDerivation?: {
    id: number;
    code: string;
    description: string;
  };
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  gtinUpc?: string;
  publishedDate: string;
  brandOwner?: string;
  ingredients?: string;
  marketCountry?: string;
  foodCategory?: {
    id: number;
    code: string;
    description: string;
  };
  foodNutrients: USDANutrient[];
  foodPortions?: Array<{
    id: number;
    amount: number;
    dataPoints: number;
    gramWeight: number;
    minYearAcquired: number;
    modifier: string;
    portionDescription: string;
    sequenceNumber: number;
    measureUnit: {
      id: number;
      name: string;
      abbreviation: string;
    };
  }>;
}

export interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

// Nutrient IDs for common nutrients
// We now use arrays to check for primary (SR Legacy/Foundation) AND alternative (Branded) IDs.
const NUTRIENT_IDS = {
  CALORIES: [1008, 208],   // Energy (KCAL)
  PROTEIN:  [1003, 203],   // Protein (G)
  CARBS:    [1005, 205],   // Carbohydrate, by difference (G)
  FATS:     [1004, 204],   // Total lipid (fat) (G)
  FIBER:    [1079, 291],   // Fiber, total dietary (G)
  SUGAR:    [2000, 269],   // Sugars, total including NLEA (G)
  SODIUM:   [1093, 307],   // Sodium, Na (MG)
};

class USDAApiService {
  private apiKey: string;

  constructor() {
    console.log('USDA API Key Status:', {
      hasKey: !!USDA_API_KEY,
      keyLength: USDA_API_KEY ? USDA_API_KEY.length : 0,
      keyPreview: USDA_API_KEY ? `${USDA_API_KEY.substring(0, 8)}...` : 'undefined'
    });
    
    if (!USDA_API_KEY) {
      console.warn('USDA API key not found. Please add VITE_USDA_API_KEY to your .env.local file');
      console.log('To get an API key: https://fdc.nal.usda.gov/api-key-signup.html');
    }
    this.apiKey = USDA_API_KEY || '';
  }

  // Get realistic mock food data based on common foods
  private getMockFoodData(query: string, amount: number, unit: string): Array<{
    fdcId: number;
    description: string;
    brandOwner?: string;
    dataType: string;
    nutrition: NutritionData;
    carbonFootprint: number;
    amount: number;
    unit: string;
  }> {
    const queryLower = query.toLowerCase();
    
    // Common food nutrition data (per 100g)
    const foodDatabase: { [key: string]: { description: string; nutrition: NutritionData; carbonFootprint: number } } = {
      'apple': {
        description: 'Apple, raw, with skin',
        nutrition: { calories: 52, protein: 0.3, carbs: 13.8, fats: 0.2, fiber: 2.4 },
        carbonFootprint: 0.4
      },
      'banana': {
        description: 'Banana, raw',
        nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3, fiber: 2.6 },
        carbonFootprint: 0.5
      },
      'chicken': {
        description: 'Chicken breast, skinless, boneless, raw',
        nutrition: { calories: 165, protein: 31.0, carbs: 0, fats: 3.6 },
        carbonFootprint: 2.5
      },
      'rice': {
        description: 'Rice, white, long-grain, regular, raw',
        nutrition: { calories: 365, protein: 7.1, carbs: 80, fats: 0.7, fiber: 1.3 },
        carbonFootprint: 1.2
      },
      'bread': {
        description: 'Bread, white, commercially prepared',
        nutrition: { calories: 265, protein: 8.9, carbs: 49, fats: 3.2, fiber: 2.7 },
        carbonFootprint: 1.8
      },
      'milk': {
        description: 'Milk, whole, 3.25% milkfat',
        nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3 },
        carbonFootprint: 1.0
      },
      'egg': {
        description: 'Egg, whole, raw, fresh',
        nutrition: { calories: 143, protein: 12.6, carbs: 0.7, fats: 9.5 },
        carbonFootprint: 1.5
      },
      'potato': {
        description: 'Potato, raw, skin',
        nutrition: { calories: 77, protein: 2.0, carbs: 17.5, fats: 0.1, fiber: 2.2 },
        carbonFootprint: 0.3
      },
      'carrot': {
        description: 'Carrots, raw',
        nutrition: { calories: 41, protein: 0.9, carbs: 9.6, fats: 0.2, fiber: 2.8 },
        carbonFootprint: 0.2
      },
      'broccoli': {
        description: 'Broccoli, raw',
        nutrition: { calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4, fiber: 2.6 },
        carbonFootprint: 0.3
      }
    };

    // Find matching foods
    const matches = Object.entries(foodDatabase).filter(([key, data]) => 
      key.includes(queryLower) || data.description.toLowerCase().includes(queryLower)
    );

    if (matches.length === 0) {
      // Return a generic food if no match found
      return [{
        fdcId: 999999,
        description: `${query} (Mock Data)`,
        brandOwner: 'Mock Brand',
        dataType: 'Mock',
        nutrition: {
          calories: Math.round(amount * 0.5),
          protein: Math.round(amount * 0.1 * 100) / 100,
          carbs: Math.round(amount * 0.3 * 100) / 100,
          fats: Math.round(amount * 0.05 * 100) / 100,
        },
        carbonFootprint: Math.round(amount * 0.001 * 1000) / 1000,
        amount,
        unit
      }];
    }

    // Return up to 3 matching foods with realistic nutrition data
    return matches.slice(0, 3).map(([key, data], index) => {
      const nutrition = this.calculateNutritionForAmount(data.nutrition, amount, unit);
      const carbonFootprint = this.calculateCarbonFootprint(nutrition, data.description);
      
      return {
        fdcId: 999000 + index,
        description: data.description,
        brandOwner: 'Mock Brand',
        dataType: 'Mock',
        nutrition,
        carbonFootprint,
        amount,
        unit
      };
    });
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${USDA_BASE_URL}${endpoint}`);
    
    // Add API key
    url.searchParams.set('api_key', this.apiKey);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Invalid API key. Please check your USDA API key.');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('USDA API request failed:', error);
      throw error;
    }
  }

  async searchFoods(query: string, pageSize: number = 25): Promise<USDASearchResponse> {
    if (!this.apiKey) {
      throw new Error('USDA API key is required');
    }

    return this.makeRequest<USDASearchResponse>('/foods/search', {
      query,
      pageSize,
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    });
  }

  async getFoodDetails(fdcId: number): Promise<USDAFood> {
    if (!this.apiKey) {
      throw new Error('USDA API key is required');
    }

    return this.makeRequest<USDAFood>(`/food/${fdcId}`);
  }

// --- REPLACE WITH THIS ---
// --- REPLACE WITH THIS ---
  extractNutritionData(food: USDAFood): NutritionData {
      const nutrients = food.foodNutrients;
      
      // Debug: Log the food and nutrients for debugging
      console.log('Extracting nutrition for:', food.description);
      // You can remove the big JSON.stringify log now if you want
      
      const getNutrientValue = (ids: number[]): number => {
        let foodNutrient: USDANutrient | undefined;
  
        for (const id of ids) {
          // --- FIX 1: Look at the NESTED 'id' ---
          foodNutrient = nutrients.find(n => n.nutrient.id === id); 
          
          if (foodNutrient) {
            // --- FIX 2: Look at the NESTED 'unitName' ---
            const unit = foodNutrient.nutrient.unitName.toUpperCase(); 
            // --- FIX 3: Look at the 'amount' property, not 'value' ---
            const value = foodNutrient.amount; 
            
            // Case 1: Calories (Energy)
            if (ids.includes(1008) || ids.includes(208)) {
              if (unit === 'KCAL') {
                return Math.round(value * 100) / 100;
              }
              if (unit === 'KJ') {
                return Math.round((value / 4.184) * 100) / 100;
              }
            } 
            
            // Case 2: Macros (Protein, Carbs, Fat, Fiber, Sugar)
            else if (ids.includes(1003) || ids.includes(1005) || ids.includes(1004) || ids.includes(1079) || ids.includes(2000)) {
              if (unit === 'G') {
                return Math.round(value * 100) / 100;
              }
              if (unit === 'MG') {
                return Math.round((value / 1000) * 100) / 100;
              }
            }
            
            // Case 3: Sodium
            else if (ids.includes(1093)) {
              if (unit === 'MG') {
                // Convert Milligrams to Grams for consistency in our app
                return Math.round((value / 1000) * 100) / 100;
              }
              if (unit === 'G') {
                 return Math.round(value * 100) / 100;
              }
            }
            
            console.warn(`Nutrient ${id} found, but unit was '${unit}'. Using value as-is.`);
            return value;
          }
        }
        
        console.log(`Nutrient not found for any ID in: [${ids.join(', ')}]`);
        return 0;
      };
  
      const result = {
        calories: getNutrientValue(NUTRIENT_IDS.CALORIES),
        protein: getNutrientValue(NUTRIENT_IDS.PROTEIN),
        carbs: getNutrientValue(NUTRIENT_IDS.CARBS),
        fats: getNutrientValue(NUTRIENT_IDS.FATS),
        fiber: getNutrientValue(NUTRIENT_IDS.FIBER),
        sugar: getNutrientValue(NUTRIENT_IDS.SUGAR),
        sodium: getNutrientValue(NUTRIENT_IDS.SODIUM),
      };
  
      console.log('Extracted nutrition data (Macros in G):', result);
      return result;
    }

  // Calculate carbon footprint based on food type and nutrition data
  calculateCarbonFootprint(nutritionData: NutritionData, foodType?: string): number {
    // Basic carbon footprint calculation based on calories
    // This is a simplified calculation - in reality, carbon footprint varies by food type
    const baseCarbonPerCalorie = 0.0005; // kg CO2 per calorie (rough estimate)
    let multiplier = 1;

    // Adjust multiplier based on food type
    if (foodType) {
      const type = foodType.toLowerCase();
      if (type.includes('meat') || type.includes('beef') || type.includes('pork')) {
        multiplier = 3.0; // Meat has higher carbon footprint
      } else if (type.includes('chicken') || type.includes('poultry')) {
        multiplier = 1.5;
      } else if (type.includes('fish') || type.includes('seafood')) {
        multiplier = 2.0;
      } else if (type.includes('dairy') || type.includes('milk') || type.includes('cheese')) {
        multiplier = 1.2;
      } else if (type.includes('vegetable') || type.includes('fruit') || type.includes('grain')) {
        multiplier = 0.5; // Plant-based foods have lower carbon footprint
      }
    }

    return Math.round(nutritionData.calories * baseCarbonPerCalorie * multiplier * 1000) / 1000; // Round to 3 decimal places
  }

  // Search and return simplified food items for UI
  async searchFoodsSimple(query: string, limit: number = 10): Promise<Array<{
    fdcId: number;
    description: string;
    brandOwner?: string;
    dataType: string;
  }>> {
    try {
      const response = await this.searchFoods(query, limit);
      return response.foods.map(food => ({
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner,
        dataType: food.dataType
      }));
    } catch (error) {
      console.error('Error searching foods:', error);
      throw error;
    }
  }

  // Get complete nutrition data for a food item
  async getFoodNutrition(fdcId: number): Promise<{
    nutrition: NutritionData;
    carbonFootprint: number;
    food: USDAFood;
  }> {
    try {
      console.log(`Getting food details for ID: ${fdcId}`);
      const food = await this.getFoodDetails(fdcId);
      console.log(`Food details retrieved:`, { 
        fdcId: food.fdcId, 
        description: food.description, 
        nutrientsCount: food.foodNutrients?.length || 0 
      });
      
      const nutrition = this.extractNutritionData(food);
      console.log(`Extracted nutrition:`, nutrition);
      
      const carbonFootprint = this.calculateCarbonFootprint(nutrition, food.description);
      
      return {
        nutrition,
        carbonFootprint,
        food
      };
    } catch (error) {
      console.error('Error getting food nutrition:', error);
      throw error;
    }
  }

  // Calculate nutrition for a specific amount of food consumed
  calculateNutritionForAmount(nutritionData: NutritionData, amount: number, unit: string = 'g'): NutritionData {
    // Convert amount to grams for calculation
    let amountInGrams = amount;
    
    if (unit.toLowerCase() === 'kg') {
      amountInGrams = amount * 1000;
    } else if (unit.toLowerCase() === 'oz') {
      amountInGrams = amount * 28.3495; // 1 oz = 28.3495g
    } else if (unit.toLowerCase() === 'lb') {
      amountInGrams = amount * 453.592; // 1 lb = 453.592g
    } else if (unit.toLowerCase() === 'cup') {
      // Approximate conversion for common foods (this is rough)
      amountInGrams = amount * 120; // Average cup weight
    } else if (unit.toLowerCase() === 'tbsp') {
      amountInGrams = amount * 15; // 1 tbsp ≈ 15g
    } else if (unit.toLowerCase() === 'tsp') {
      amountInGrams = amount * 5; // 1 tsp ≈ 5g
    } else if (unit.toLowerCase() === 'piece' || unit.toLowerCase() === 'pcs') {
      // For items sold by piece, assume average weight
      amountInGrams = amount * 50; // Average piece weight
    }

    // Calculate nutrition per 100g (standard USDA base)
    const multiplier = amountInGrams / 100;

    return {
      calories: Math.round(nutritionData.calories * multiplier),
      protein: Math.round(nutritionData.protein * multiplier * 100) / 100,
      carbs: Math.round(nutritionData.carbs * multiplier * 100) / 100,
      fats: Math.round(nutritionData.fats * multiplier * 100) / 100,
      fiber: nutritionData.fiber ? Math.round(nutritionData.fiber * multiplier * 100) / 100 : undefined,
      sugar: nutritionData.sugar ? Math.round(nutritionData.sugar * multiplier * 100) / 100 : undefined,
      sodium: nutritionData.sodium ? Math.round(nutritionData.sodium * multiplier * 100) / 100 : undefined,
    };
  }

  // Get nutrition data for a specific food and amount
  async getFoodNutritionForAmount(fdcId: number, amount: number, unit: string = 'g'): Promise<{
    nutrition: NutritionData;
    carbonFootprint: number;
    food: USDAFood;
    amount: number;
    unit: string;
  }> {
    try {
      const { nutrition: baseNutrition, carbonFootprint: baseCarbon, food } = await this.getFoodNutrition(fdcId);
      const nutrition = this.calculateNutritionForAmount(baseNutrition, amount, unit);
      const carbonFootprint = this.calculateCarbonFootprint(nutrition, food.description);
      
      return {
        nutrition,
        carbonFootprint,
        food,
        amount,
        unit
      };
    } catch (error) {
      console.error('Error getting food nutrition for amount:', error);
      throw error;
    }
  }

  // Search foods and get nutrition for a specific amount
  async searchAndGetNutrition(query: string, amount: number, unit: string = 'g'): Promise<Array<{
    fdcId: number;
    description: string;
    brandOwner?: string;
    dataType: string;
    nutrition: NutritionData;
    carbonFootprint: number;
    amount: number;
    unit: string;
  }>> {
    console.log('searchAndGetNutrition called with:', { query, amount, unit, hasApiKey: !!this.apiKey });
    
    if (!this.apiKey) {
      console.warn('USDA API key not found. Returning realistic mock data for testing.');
      console.log('To get real data, add VITE_USDA_API_KEY to your .env.local file');
      
      // Return realistic mock data based on common foods
      const mockFoods = this.getMockFoodData(query, amount, unit);
      console.log('Returning mock data:', mockFoods);
      return mockFoods;
    }

    try {
      console.log('Searching for foods with query:', query);
      const searchResults = await this.searchFoodsSimple(query, 5); // Limit to 5 results
      console.log('Search results:', searchResults);
      const results = [];

      for (const food of searchResults) {
        try {
          console.log(`Getting nutrition for ${food.description} (ID: ${food.fdcId})`);
          const nutritionData = await this.getFoodNutritionForAmount(food.fdcId, amount, unit);
          console.log(`Nutrition data for ${food.description}:`, nutritionData.nutrition);
          
          results.push({
            fdcId: food.fdcId,
            description: food.description,
            brandOwner: food.brandOwner,
            dataType: food.dataType,
            nutrition: nutritionData.nutrition,
            carbonFootprint: nutritionData.carbonFootprint,
            amount: nutritionData.amount,
            unit: nutritionData.unit
          });
        } catch (error) {
          console.warn(`Failed to get nutrition for ${food.description}:`, error);
          // Continue with other foods even if one fails
        }
      }

      console.log('Final results:', results);
      return results;
    } catch (error) {
      console.error('Error searching and getting nutrition:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const usdaApi = new USDAApiService();

// Export types for use in components
export type { USDANutrient, USDAFood, USDASearchResponse, NutritionData };

// Debug function to test API key
export const testUSDAConnection = async () => {
  console.log('Testing USDA API connection...');
  console.log('API Key status:', {
    hasKey: !!USDA_API_KEY,
    keyLength: USDA_API_KEY?.length || 0,
    keyPreview: USDA_API_KEY ? `${USDA_API_KEY.substring(0, 8)}...` : 'undefined'
  });
  
  if (!USDA_API_KEY) {
    console.error('No API key found! Please add VITE_USDA_API_KEY to .env.local');
    return false;
  }
  
  try {
    const response = await fetch(`${USDA_BASE_URL}/foods/search?query=apple&api_key=${USDA_API_KEY}&pageSize=1`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ USDA API connection successful!', data);
      return true;
    } else {
      console.error('❌ USDA API error:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ USDA API connection failed:', error);
    return false;
  }
};
