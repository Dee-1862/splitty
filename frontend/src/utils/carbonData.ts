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
 * Calculate carbon footprint for a list of food items
 * @param {array} foodItems - Array of food item names
 * @param {number} portionSize - Portion size in grams (default 200g)
 * @returns {number} Total carbon footprint in kg
 */
export function calculateMealCarbon(foodItems: string[], portionSize: number = 200): number {
  if (!foodItems || foodItems.length === 0) return 0
  
  let totalCarbon = 0
  
  foodItems.forEach(item => {
    const normalizedItem = item.toLowerCase().trim().replace(/\s+/g, ' ')
    
    // Try exact match first
    let carbonPer100g = carbonFootprint[normalizedItem]
    
    // If no exact match, try partial match
    if (!carbonPer100g) {
      const matchedKey = Object.keys(carbonFootprint).find(key => 
        normalizedItem.includes(key) || key.includes(normalizedItem)
      )
      carbonPer100g = matchedKey ? carbonFootprint[matchedKey] : carbonFootprint.default
    }
    
    totalCarbon += (carbonPer100g * portionSize) / 100
  })
  
  return parseFloat(totalCarbon.toFixed(3))
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
}

export function getSustainableAlternatives(foodItems: string[]): Alternative[] {
  const alternatives: Alternative[] = []
  
  const alternativeMap: Record<string, Omit<Alternative, 'original'>> = {
    beef: {
      suggestion: 'lentils or chickpeas',
      carbonSaved: 2.3,
      healthBenefit: 'High in fiber and plant-based protein, lower cholesterol'
    },
    'ground beef': {
      suggestion: 'Beyond Meat or lentils',
      carbonSaved: 2.3,
      healthBenefit: 'Lower saturated fat and cholesterol'
    },
    lamb: {
      suggestion: 'chicken or tofu',
      carbonSaved: 1.8,
      healthBenefit: 'Lower saturated fat and calories'
    },
    pork: {
      suggestion: 'chicken or turkey',
      carbonSaved: 0.1,
      healthBenefit: 'Leaner protein option'
    },
    cheese: {
      suggestion: 'nutritional yeast or cashew cheese',
      carbonSaved: 1.2,
      healthBenefit: 'Lower cholesterol and saturated fat, dairy-free'
    },
    butter: {
      suggestion: 'avocado or olive oil',
      carbonSaved: 0.9,
      healthBenefit: 'Heart-healthy unsaturated fats, vitamin E'
    },
    milk: {
      suggestion: 'oat milk or almond milk',
      carbonSaved: 0.2,
      healthBenefit: 'Lactose-free, lower calories, fortified with vitamins'
    },
    rice: {
      suggestion: 'quinoa or bulgur wheat',
      carbonSaved: 0.3,
      healthBenefit: 'Higher protein and fiber, complete amino acids'
    },
    salmon: {
      suggestion: 'mackerel or sardines',
      carbonSaved: 0.5,
      healthBenefit: 'Still rich in omega-3, more sustainable'
    }
  }
  
  foodItems.forEach(item => {
    const normalizedItem = item.toLowerCase().trim()
    
    // Check for exact or partial matches
    Object.keys(alternativeMap).forEach(key => {
      if (normalizedItem.includes(key) || key.includes(normalizedItem)) {
        if (!alternatives.find(alt => alt.original === item)) {
          alternatives.push({
            original: item,
            ...alternativeMap[key]
          })
        }
      }
    })
  })
  
  return alternatives
}
