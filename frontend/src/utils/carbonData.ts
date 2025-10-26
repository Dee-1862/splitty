/**
 * Carbon footprint database (kg CO2 per 100g)
 * Source: Our World in Data & Climate research
 */
export const carbonFootprint: Record<string, number> = {
  // Proteins
  beef: 2.5,
  'ground beef': 2.5,
  steak: 2.5,
  lamb: 2.4,
  pork: 0.7,
  bacon: 0.7,
  chicken: 0.6,
  'chicken breast': 0.6,
  turkey: 0.6,
  fish: 0.5,
  salmon: 1.1,
  tuna: 0.6,
  shrimp: 1.2,
  eggs: 0.4,
  tofu: 0.2,
  tempeh: 0.2,
  lentils: 0.09,
  beans: 0.08,
  'black beans': 0.08,
  'kidney beans': 0.08,
  chickpeas: 0.09,
  
  // Dairy
  cheese: 1.4,
  'cheddar cheese': 1.4,
  milk: 0.3,
  yogurt: 0.2,
  butter: 1.2,
  cream: 0.4,
  'ice cream': 0.5,
  
  // Grains
  rice: 0.4,
  'white rice': 0.4,
  'brown rice': 0.4,
  bread: 0.1,
  'whole wheat bread': 0.1,
  pasta: 0.1,
  wheat: 0.06,
  oats: 0.05,
  quinoa: 0.1,
  
  // Vegetables
  broccoli: 0.04,
  carrots: 0.04,
  tomatoes: 0.1,
  lettuce: 0.03,
  spinach: 0.02,
  kale: 0.03,
  potatoes: 0.03,
  'sweet potatoes': 0.04,
  onions: 0.03,
  peppers: 0.07,
  'bell peppers': 0.07,
  cucumber: 0.03,
  zucchini: 0.03,
  
  // Fruits
  apples: 0.04,
  bananas: 0.06,
  oranges: 0.04,
  berries: 0.1,
  strawberries: 0.1,
  blueberries: 0.1,
  avocado: 0.08,
  grapes: 0.05,
  
  // Nuts & Seeds
  almonds: 0.2,
  peanuts: 0.3,
  'peanut butter': 0.3,
  walnuts: 0.2,
  cashews: 0.2,
  
  // Oils & Fats
  'olive oil': 0.5,
  'vegetable oil': 0.3,
  'coconut oil': 0.6,
  
  // Beverages
  coffee: 0.02,
  tea: 0.01,
  
  // Default for unknown items
  default: 0.2
}

/**
 * Get sustainable alternatives for high-carbon foods
 * @param {array} foodItems - Array of food items
 * @returns {array} Array of alternative suggestions
 */
export interface Alternative {
  original: string;
  suggestion: string;
  carbonSaved: number;
  healthBenefit: string;
  dietaryType: 'vegan' | 'vegetarian' | 'pescatarian' | 'flexitarian';
  proteinRich?: boolean;
}

export function getSustainableAlternatives(foodItems: string[]): Alternative[] {
  const alternatives: Alternative[] = []
  
  // Helper function to calculate carbon footprint (matching USDA API logic)
  const calculateCarbonFromName = (foodName: string): number => {
    const normalized = foodName.toLowerCase().trim().replace(/\s+/g, ' ')
    
    // Try exact match first
    if (carbonFootprint[normalized]) {
      return carbonFootprint[normalized]
    }
    
    // Try partial match
    const matchedKey = Object.keys(carbonFootprint).find(key => 
      normalized.includes(key) || key.includes(normalized)
    )
    
    if (matchedKey) {
      return carbonFootprint[matchedKey]
    }
    
    // Fallback to USDA-style calculation (estimate based on food type)
    // This mirrors what usdaApi.calculateCarbonFootprint does
    const baseCarbonPerCalorie = 0.0005 // kg CO2 per calorie
    let multiplier = 1
    
    if (normalized.includes('beef') || normalized.includes('meat') || normalized.includes('steak') || 
        normalized.includes('pork') || normalized.includes('bacon')) {
      multiplier = 3.0 // High carbon
    } else if (normalized.includes('chicken') || normalized.includes('poultry') || normalized.includes('turkey')) {
      multiplier = 1.5
    } else if (normalized.includes('fish') || normalized.includes('salmon') || normalized.includes('tuna') || 
               normalized.includes('shrimp') || normalized.includes('seafood')) {
      multiplier = 2.0
    } else if (normalized.includes('dairy') || normalized.includes('milk') || normalized.includes('cheese') || 
               normalized.includes('butter') || normalized.includes('yogurt') || normalized.includes('cream')) {
      multiplier = 1.2
    } else if (normalized.includes('vegetable') || normalized.includes('fruit') || normalized.includes('grain') ||
               normalized.includes('broccoli') || normalized.includes('carrot') || normalized.includes('lettuce') ||
               normalized.includes('spinach') || normalized.includes('apple') || normalized.includes('banana') ||
               normalized.includes('rice') || normalized.includes('bread') || normalized.includes('pasta') ||
               normalized.includes('quinoa') || normalized.includes('oats')) {
      multiplier = 0.5 // Low carbon
    }
    
    // Estimate calories (rough average: 100-300 per 100g depending on type)
    const estimatedCalories = multiplier >= 2.0 ? 200 : 150
    const carbonPer100g = (estimatedCalories * baseCarbonPerCalorie * multiplier).toFixed(2)
    
    return parseFloat(carbonPer100g)
  }
  
  // Helper function to determine dietary type
  const getDietaryType = (food: string): 'vegan' | 'vegetarian' | 'pescatarian' | 'flexitarian' => {
    const meatFish = ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'bacon', 'steak', 'ground beef', 'salmon', 'tuna', 'fish', 'shrimp']
    const dairy = ['cheese', 'milk', 'butter', 'yogurt', 'cream', 'ice cream']
    const fish = ['salmon', 'tuna', 'fish', 'shrimp', 'mackerel', 'sardines']
    
    const normalized = food.toLowerCase()
    
    if (meatFish.some(m => normalized.includes(m))) {
      if (fish.some(f => normalized.includes(f))) {
        return 'pescatarian'
      }
      return 'flexitarian'
    }
    if (dairy.some(d => normalized.includes(d))) {
      return 'vegetarian'
    }
    return 'vegan'
  }
  
  // Helper function to check if food is protein-rich
  const isProteinRich = (food: string): boolean => {
    const proteins = ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp', 
                      'tofu', 'tempeh', 'lentils', 'beans', 'chickpeas', 'black beans', 'kidney beans', 
                      'eggs', 'quinoa']
    const normalized = food.toLowerCase()
    return proteins.some(p => normalized.includes(p))
  }
  
  // Helper function to get health benefit based on carbon savings and food type
  const getHealthBenefit = (originalFood: string, _suggestedFood: string, carbonSaved: number): string => {
    const meatProteins = ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'bacon', 'steak']
    const dairy = ['cheese', 'milk', 'butter', 'yogurt', 'cream']
    
    const normalized = originalFood.toLowerCase()
    
    if (meatProteins.some(m => normalized.includes(m))) {
      return 'Lower saturated fat, heart-healthy option'
    }
    if (dairy.some(d => normalized.includes(d))) {
      return 'Dairy-free, lactose-free option'
    }
    if (carbonSaved > 1) {
      return 'Significantly lower environmental impact'
    }
    if (carbonSaved > 0.5) {
      return 'Better for the environment and your health'
    }
    return 'More nutritious and sustainable option'
  }
  
  // Simple weighted scoring model to find best alternatives
  const findBestAlternatives = (originalFood: string): Omit<Alternative, 'original'> | null => {
    const normalizedOriginal = originalFood.toLowerCase().trim().replace(/\s+/g, ' ')
    
    // Get carbon footprint of original food (using new helper function)
    const originalCarbon = calculateCarbonFromName(originalFood)
    
    // Find all foods with lower carbon footprint
    // First, check foods in our database
    const betterAlternatives: Array<{food: string, carbon: number}> = []
    
    for (const [food, carbon] of Object.entries(carbonFootprint)) {
      if (food === 'default') continue
      
      const normalizedFood = food.toLowerCase()
      
      // Skip if it's the same food or similar
      if (normalizedFood === normalizedOriginal || 
          normalizedFood.includes(normalizedOriginal) || 
          normalizedOriginal.includes(normalizedFood)) {
        continue
      }
      
      // Only include foods with significantly lower carbon (at least 10% reduction)
      if (carbon < originalCarbon * 0.9) {
        betterAlternatives.push({ food, carbon })
      }
    }
    
    // Also add common alternatives not in our database (calculating their carbon dynamically)
    const commonAlternatives = [
      'tofu', 'tempeh', 'seitan', 'beans', 'lentils', 'chickpeas', 'quinoa',
      'mushrooms', 'nuts', 'seeds', 'olive oil', 'avocado', 'sweet potato',
      'oats', 'barley', 'brown rice', 'whole wheat pasta'
    ]
    
    for (const food of commonAlternatives) {
      // Skip if already in betterAlternatives
      if (betterAlternatives.some(alt => alt.food === food)) continue
      
      // Skip if it's the same food
      const normalizedFood = food.toLowerCase()
      if (normalizedFood === normalizedOriginal || 
          normalizedFood.includes(normalizedOriginal) || 
          normalizedOriginal.includes(normalizedFood)) {
        continue
      }
      
      // Calculate carbon for this alternative
      const carbon = calculateCarbonFromName(food)
      
      // Only include if significantly lower carbon
      if (carbon < originalCarbon * 0.9) {
        betterAlternatives.push({ food, carbon })
      }
    }
    
    if (betterAlternatives.length === 0) return null
    
    // Score each alternative based on multiple factors
    const scoredAlternatives = betterAlternatives.map(({ food, carbon }) => {
      let score = 0
      
      // 40% weight: Carbon savings (more is better)
      const carbonSaved = originalCarbon - carbon
      score += (carbonSaved / originalCarbon) * 40
      
      // 30% weight: Similarity in food category (protein for protein, grain for grain, etc.)
      const categories = {
        protein: ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp', 'tofu', 'tempeh', 'lentils', 'beans', 'chickpeas', 'eggs'],
        dairy: ['cheese', 'milk', 'butter', 'yogurt', 'cream'],
        grain: ['rice', 'bread', 'pasta', 'wheat', 'oats', 'quinoa'],
        produce: ['broccoli', 'carrots', 'tomatoes', 'lettuce', 'spinach', 'kale', 'potatoes', 'apples', 'bananas']
      }
      
      const originalCategory = Object.entries(categories).find(([, foods]) => 
        foods.some(f => normalizedOriginal.includes(f))
      )?.[0]
      
      const foodCategory = Object.entries(categories).find(([, foods]) => 
        foods.some(f => food.includes(f))
      )?.[0]
      
      if (originalCategory && foodCategory === originalCategory) {
        score += 30
      }
      
      // 20% weight: Protein content match (if original is protein-rich)
      if (isProteinRich(originalFood) && isProteinRich(food)) {
        score += 20
      }
      
      // 10% weight: Prefer lower absolute carbon footprint
      score += (1 / (carbon + 1)) * 10
      
      return { food, carbon, carbonSaved, score }
    })
    
    // Sort by score and get the top alternative
    scoredAlternatives.sort((a, b) => b.score - a.score)
    
    if (scoredAlternatives.length === 0) return null
    
    const best = scoredAlternatives[0]
    
    return {
      suggestion: best.food.charAt(0).toUpperCase() + best.food.slice(1),
      carbonSaved: parseFloat(best.carbonSaved.toFixed(2)),
      healthBenefit: getHealthBenefit(originalFood, best.food, best.carbonSaved),
      dietaryType: getDietaryType(best.food),
      proteinRich: isProteinRich(best.food)
    }
  }
  
  // Find alternatives for each food item
  foodItems.forEach(item => {
    const alternative = findBestAlternatives(item)
    
    if (alternative) {
      alternatives.push({
        original: item,
        ...alternative
      })
    }
  })
  
  return alternatives
}
