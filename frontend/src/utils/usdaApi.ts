// USDA FoodData Central API Service
// Get your free API key from: https://fdc.nal.usda.gov/api-key-signup.html

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
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
const NUTRIENT_IDS = {
  CALORIES: 1008, // Energy
  PROTEIN: 1003, // Protein
  CARBS: 1005,   // Carbohydrate, by difference
  FATS: 1004,    // Total lipid (fat)
  FIBER: 1079,   // Fiber, total dietary
  SUGAR: 2000,   // Sugars, total including NLEA
  SODIUM: 1093,  // Sodium, Na
};

class USDAApiService {
  private apiKey: string;

  constructor() {
    if (!USDA_API_KEY) {
      console.warn('USDA API key not found. Please add VITE_USDA_API_KEY to your .env.local file');
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

  extractNutritionData(food: USDAFood): NutritionData {
    const nutrients = food.foodNutrients;
    
    // Debug: Log the food and nutrients for debugging
    console.log('Extracting nutrition for:', food.description);
    console.log('Available nutrients:', nutrients.map(n => ({ id: n.nutrientId, name: n.nutrientName, value: n.value })));
    
    const getNutrientValue = (nutrientId: number, alternativeIds?: number[], searchNames?: string[]): number => {
      let nutrient = nutrients.find(n => n.nutrientId === nutrientId);
      
      // Try alternative IDs if primary not found
      if (!nutrient && alternativeIds) {
        for (const altId of alternativeIds) {
          nutrient = nutrients.find(n => n.nutrientId === altId);
          if (nutrient) break;
        }
      }
      
      // Try searching by name if still not found
      if (!nutrient && searchNames) {
        for (const name of searchNames) {
          nutrient = nutrients.find(n => 
            n.nutrientName.toLowerCase().includes(name.toLowerCase())
          );
          if (nutrient) break;
        }
      }
      
      if (nutrient) {
        console.log(`Found nutrient ${nutrientId}: ${nutrient.nutrientName} = ${nutrient.value}`);
        return Math.round(nutrient.value * 100) / 100;
      } else {
        console.log(`Nutrient ${nutrientId} not found`);
        return 0;
      }
    };

    const result = {
      calories: getNutrientValue(NUTRIENT_IDS.CALORIES, [1008, 1062], ['energy', 'calories']),
      protein: getNutrientValue(NUTRIENT_IDS.PROTEIN, [1003], ['protein']),
      carbs: getNutrientValue(NUTRIENT_IDS.CARBS, [1005], ['carbohydrate', 'carbs']),
      fats: getNutrientValue(NUTRIENT_IDS.FATS, [1004], ['fat', 'lipid', 'total lipid']),
      fiber: getNutrientValue(NUTRIENT_IDS.FIBER, [1079], ['fiber', 'dietary fiber']),
      sugar: getNutrientValue(NUTRIENT_IDS.SUGAR, [2000], ['sugar', 'sugars']),
      sodium: getNutrientValue(NUTRIENT_IDS.SODIUM, [1093], ['sodium', 'na']),
    };

    console.log('Extracted nutrition data:', result);
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
      const food = await this.getFoodDetails(fdcId);
      const nutrition = this.extractNutritionData(food);
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
    if (!this.apiKey) {
      console.warn('USDA API key not found. Returning realistic mock data for testing.');
      console.log('To get real data, add VITE_USDA_API_KEY to your .env.local file');
      
      // Return realistic mock data based on common foods
      const mockFoods = this.getMockFoodData(query, amount, unit);
      return mockFoods;
    }

    try {
      const searchResults = await this.searchFoodsSimple(query, 5); // Limit to 5 results
      const results = [];

      for (const food of searchResults) {
        try {
          const nutritionData = await this.getFoodNutritionForAmount(food.fdcId, amount, unit);
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
