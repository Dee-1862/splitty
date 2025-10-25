export interface ActivityLevel {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface Goal {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  { 
    value: 'sedentary', 
    label: 'Sedentary', 
    description: 'Little or no exercise, desk job',
    icon: '💺'
  },
  { 
    value: 'lightly_active', 
    label: 'Lightly Active', 
    description: 'Exercise 1-3 days/week',
    icon: '🚶'
  },
  { 
    value: 'moderately_active', 
    label: 'Moderately Active', 
    description: 'Exercise 3-5 days/week',
    icon: '🏃'
  },
  { 
    value: 'very_active', 
    label: 'Very Active', 
    description: 'Exercise 6-7 days/week',
    icon: '🏋️'
  },
  { 
    value: 'extremely_active', 
    label: 'Extremely Active', 
    description: 'Physical job or 2x training/day',
    icon: '💪'
  }
]

export const GOALS: Goal[] = [
  { 
    value: 'lose_weight', 
    label: 'Lose Weight', 
    description: 'Lose ~0.5kg per week safely',
    icon: '📉',
    color: 'text-blue-600'
  },
  { 
    value: 'maintain', 
    label: 'Maintain Weight', 
    description: 'Stay at current weight',
    icon: '⚖️',
    color: 'text-green-600'
  },
  { 
    value: 'gain_muscle', 
    label: 'Build Muscle', 
    description: 'Gain ~0.5kg per week with training',
    icon: '💪',
    color: 'text-orange-600'
  },
  { 
    value: 'improve_health', 
    label: 'Improve Health', 
    description: 'General wellness and nutrition',
    icon: '❤️',
    color: 'text-red-600'
  }
]

export const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
  { value: 'dairy_free', label: 'Dairy-Free', icon: '🥛' },
  { value: 'keto', label: 'Keto', icon: '🥑' },
  { value: 'paleo', label: 'Paleo', icon: '🦴' },
  { value: 'pescatarian', label: 'Pescatarian', icon: '🐟' }
]

export const ALLERGIES = [
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' }
]
