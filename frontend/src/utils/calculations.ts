/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
export function calculateBMR(weight: number, height: number, age: number, gender: string) {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age
  return Math.round(gender === 'male' ? baseBMR + 5 : baseBMR - 161)
}

/**
 * Calculate Total Daily Energy Expenditure
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories
 */
export function calculateTDEE(bmr: number, activityLevel: string) {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  }
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2))
}

/**
 * Calculate daily calorie goal based on user goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - User's goal
 * @returns {number} Daily calorie target
 */
export function calculateDailyCalories(tdee: number, goal: string) {
  const adjustments: Record<string, number> = {
    lose_weight: -500,
    maintain: 0,
    gain_muscle: 300,
    improve_health: 0
  }
  return Math.round(tdee + (adjustments[goal] || 0))
}

/**
 * Calculate macro split (30% protein, 40% carbs, 30% fats)
 * @param {number} dailyCalories - Daily calorie target
 * @returns {object} Macro targets in grams
 */
export function calculateMacros(dailyCalories: number) {
  return {
    protein: Math.round((dailyCalories * 0.3) / 4), // 4 cal per gram
    carbs: Math.round((dailyCalories * 0.4) / 4),
    fats: Math.round((dailyCalories * 0.3) / 9) // 9 cal per gram
  }
}

/**
 * Calculate BMI
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI
 */
export function calculateBMI(weight: number, height: number) {
  const heightInMeters = height / 100
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
export function getBMICategory(bmi: number) {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}
