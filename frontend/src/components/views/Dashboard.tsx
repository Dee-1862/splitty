import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../AuthContext'; 
import { Plus, UtensilsCrossed, Leaf, Lightbulb, ArrowRight, Droplet, Activity } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getMeals, getProfile, calculateDailyStats, addMeal, getWaterIntake, addWaterIntake, calculateBMI, getBMICategory, type Meal, type Profile } from '../../utils/database';
import { AddMealModal } from './AddMealModal';
import { toast } from 'react-toastify';
import { getSustainableAlternatives } from '../../utils/carbonData';

interface DailyStats {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_carbon: number;
  goal_calories: number;
  goal_protein: number;
  goal_carbs: number;
  goal_fats: number;
}

interface WeeklyTrend {
  calories: number[];
  protein: number[];
  carbs: number[];
  fats: number[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    total_carbon: 0,
    goal_calories: 2000,
    goal_protein: 150,
    goal_carbs: 250,
    goal_fats: 67
  });
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend>({
    calories: [1800, 2100, 1950, 2200, 1900, 2000, 0],
    protein: [140, 155, 148, 160, 145, 150, 0],
    carbs: [230, 260, 245, 270, 240, 250, 0],
    fats: [60, 70, 65, 72, 62, 67, 0]
  });
  const [streak] = useState({ calories: 1, carbon: 1 });
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current || !user) return;

    try {
      console.log('fetchData called, user ID:', user.id);
      fetchingRef.current = true;
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching data for date:', today);

      const [profileData, mealsData, waterData] = await Promise.all([
        getProfile(user.id),
        getMeals(user.id, today),
        getWaterIntake(user.id, today)
      ]);

      console.log('Profile data:', profileData);
      console.log('Meals data:', mealsData);
      console.log('Water intake:', waterData);

      setProfile(profileData);
      setMeals(mealsData);
      setWaterIntake(waterData);

      const stats = calculateDailyStats(mealsData, profileData || {});
      console.log('Calculated stats:', stats);
      setDailyStats(stats);

      // Update weekly trend with today's data
      setWeeklyTrend(prev => ({
        calories: [...prev.calories.slice(0, 6), stats.total_calories],
        protein: [...prev.protein.slice(0, 6), stats.total_protein],
        carbs: [...prev.carbs.slice(0, 6), stats.total_carbs],
        fats: [...prev.fats.slice(0, 6), stats.total_fats]
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('Dashboard useEffect triggered, user:', user);
    if (user) {
      console.log('User found, fetching data...');
      fetchData();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user?.id, fetchData]);

  const calorieProgress = Math.min((dailyStats.total_calories / dailyStats.goal_calories) * 100, 100);
  const proteinProgress = Math.min((dailyStats.total_protein / dailyStats.goal_protein) * 100, 100);
  const carbsProgress = Math.min((dailyStats.total_carbs / dailyStats.goal_carbs) * 100, 100);
  const fatsProgress = Math.min((dailyStats.total_fats / dailyStats.goal_fats) * 100, 100);

  // Calculate quality score
  const calculateQualityScore = () => {
    if (meals.length === 0) return 0;
    
    const maxScore = 100;
    let score = 0;
    
    meals.forEach(meal => {
      let mealScore = 0;
      
      // Calorie balance (30% of score)
      const calorieRatio = Math.min(meal.calories / 500, 1);
      mealScore += calorieRatio * 30;
      
      // Protein content (25% of score)
      const proteinRatio = Math.min((meal.protein_g || 0) / 30, 1);
      mealScore += proteinRatio * 25;
      
      // Carbon footprint (20% of score) - lower is better
      const carbonRatio = Math.max(0, 1 - ((meal.carbon_kg || 0) / 2));
      mealScore += carbonRatio * 20;
      
      // Macro balance (25% of score)
      const totalMacros = (meal.protein_g || 0) + (meal.carbs_g || 0) + (meal.fats_g || 0);
      if (totalMacros > 0) {
        const proteinBalance = (meal.protein_g || 0) / totalMacros;
        const carbsBalance = (meal.carbs_g || 0) / totalMacros;
        const fatsBalance = (meal.fats_g || 0) / totalMacros;
        
        // Ideal ratios: 30% protein, 50% carbs, 20% fats
        const proteinScore = Math.max(0, 1 - Math.abs(proteinBalance - 0.3) * 2);
        const carbsScore = Math.max(0, 1 - Math.abs(carbsBalance - 0.5) * 2);
        const fatsScore = Math.max(0, 1 - Math.abs(fatsBalance - 0.2) * 2);
        
        mealScore += (proteinScore + carbsScore + fatsScore) / 3 * 25;
      }
      
      score += (mealScore / 100) * 10;
    });
    
    return Math.round(Math.min(score, maxScore));
  };

  const qualityScore = calculateQualityScore();

  const [animatedProgress, setAnimatedProgress] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    quality: 0,
    carbon: 0
  });

  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      setAnimatedProgress({
        calories: calorieProgress,
        protein: proteinProgress,
        carbs: carbsProgress,
        fats: fatsProgress,
        quality: qualityScore,
        carbon: Math.min((dailyStats.total_carbon / 5) * 100, 100)
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [calorieProgress, proteinProgress, carbsProgress, fatsProgress, qualityScore, dailyStats.total_carbon, loading]);

  const getCalorieStatus = () => {
    const percent = calorieProgress;
    if (percent < 10) return { text: "Just getting started", color: "text-slate-400" };
    if (percent < 50) return { text: "Good progress", color: "text-blue-400" };
    if (percent < 90) return { text: "Almost there", color: "text-emerald-400" };
    if (percent < 100) return { text: "Nearly perfect", color: "text-emerald-400" };
    return { text: "Goal achieved", color: "text-emerald-400" };
  };

  const getCarbonStatus = () => {
    const kg = dailyStats.total_carbon;
    if (kg < 1) return { text: "Eco champion", color: "text-emerald-400" };
    if (kg < 3) return { text: "Great choices", color: "text-emerald-400" };
    if (kg < 5) return { text: "Stay mindful", color: "text-amber-400" };
    return { text: "Try alternatives", color: "text-orange-400" };
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const calorieStatus = getCalorieStatus();
  const carbonStatus = getCarbonStatus();

  const getQualityStatus = () => {
    if (qualityScore >= 90) return { text: "Exceptional nutrition", color: "text-emerald-400" };
    if (qualityScore >= 75) return { text: "Great balance", color: "text-emerald-400" };
    if (qualityScore >= 60) return { text: "Good choices", color: "text-blue-400" };
    if (qualityScore >= 40) return { text: "Room to improve", color: "text-amber-400" };
    return { text: "Start tracking meals", color: "text-slate-400" };
  };

  const qualityStatus = getQualityStatus();

  // Calculate smart insight
  const getSmartInsight = () => {
    if (meals.length === 0) return null;
    
    const mealsByType = meals.reduce((acc, meal) => {
      acc[meal.meal_type] = (acc[meal.meal_type] || 0) + (meal.calories || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const totalCals = dailyStats.total_calories;
    const dominantMeal = Object.entries(mealsByType).sort(([, a], [, b]) => b - a)[0];
    
    if (dominantMeal && totalCals > 0) {
      const percent = Math.round((dominantMeal[1] / totalCals) * 100);
      if (percent > 50) {
        return {
          text: `${percent}% of calories from ${dominantMeal[0]}`,
          subtitle: "Consider spreading meals throughout the day",
          icon: "⚖️"
        };
      }
    }
    
    if (dailyStats.total_carbon < 2 && meals.length >= 2) {
      return {
        text: "Low carbon footprint today",
        subtitle: "40% better than average",
        icon: "🌱"
      };
    }
    
    if (calorieProgress >= 90 && calorieProgress <= 110) {
      return {
        text: "Perfect calorie tracking",
        subtitle: "Right on target with your goals",
        icon: "🎯"
      };
    }
    
    return null;
  };

  const smartInsight = getSmartInsight();

  // Calculate BMI and hydration status
  const bmi = profile ? calculateBMI(profile.weight || 0, profile.height || 0) : 0;
  const bmiCategory = getBMICategory(bmi);
  const goalWater = profile?.goal_water || 2000; // ml
  const waterProgress = Math.min((waterIntake / goalWater) * 100, 100);

  // Handle water intake button
  const handleAddWater = async (amount: number) => {
    if (!user) return;
    
    try {
      console.log('Adding water intake:', { userId: user.id, amount });
      const today = new Date().toISOString().split('T')[0];
      const result = await addWaterIntake(user.id, amount);
      console.log('Water intake result:', result);
      
      if (result) {
        const newIntake = await getWaterIntake(user.id, today);
        console.log('New water intake:', newIntake);
        setWaterIntake(newIntake);
        toast.success(`Added ${amount}ml of water`);
      } else {
        console.error('Failed to add water intake');
        toast.error('Failed to add water');
      }
    } catch (error) {
      console.error('Error adding water:', error);
      toast.error('Failed to add water');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Minimal Header */}
        <div className="mb-12 sm:mb-16">
          <p className="text-sm text-slate-500 mb-3 font-medium tracking-wide">{dateString}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-2">
            Today
          </h1>
        </div>

        {/* Hero Calories Card */}
        <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl p-6 sm:p-8 mb-6 border border-slate-800/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white mb-1 tracking-wide">Calories</h2>
              <p className="text-xs text-slate-400">Daily Energy</p>
            </div>
            <div className={`text-xl font-semibold ${calorieStatus.color}`}>
              {Math.round(calorieProgress)}%
            </div>
          </div>
          
          {/* Large number display */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
                {dailyStats.total_calories}
              </span>
              <span className="text-2xl text-slate-600 font-light">/</span>
              <span className="text-2xl text-slate-500 font-light">
                {dailyStats.goal_calories}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">calories</p>
          </div>
          
          {/* Clean progress bar */}
          <div className="relative mb-4">
            <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${animatedProgress.calories}%` }}
              />
            </div>
          </div>

          <div>
            <p className={`text-sm font-medium ${calorieStatus.color}`}>
              {calorieStatus.text}
            </p>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <MacroCard
            label="Protein"
            value={Math.round(dailyStats.total_protein)}
            goal={dailyStats.goal_protein}
            percent={animatedProgress.protein}
            color="blue"
            unit="g"
            trend={weeklyTrend.protein}
          />
          <MacroCard
            label="Carbs"
            value={Math.round(dailyStats.total_carbs)}
            goal={dailyStats.goal_carbs}
            percent={animatedProgress.carbs}
            color="amber"
            unit="g"
            trend={weeklyTrend.carbs}
          />
          <MacroCard
            label="Fats"
            value={Math.round(dailyStats.total_fats)}
            goal={dailyStats.goal_fats}
            percent={animatedProgress.fats}
            color="rose"
            unit="g"
            trend={weeklyTrend.fats}
          />
        </div>

        {/* Quality Score & Streaks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Quality Score */}
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white mb-1 tracking-wide uppercase">Quality Score</h2>
                  <p className="text-xs text-slate-400">Overall nutrition</p>
                </div>
                <div className="text-4xl font-bold text-white">
                  {qualityScore}
                </div>
              </div>
              
              <div className="relative mb-4">
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${animatedProgress.quality}%`,
                      background: 'linear-gradient(to right, #8b5cf6, #a78bfa)'
                    }}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className={`text-sm font-medium ${qualityStatus.color}`}>
                  {qualityStatus.text}
                </p>
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-white mb-1 tracking-wide uppercase">Streaks</h2>
                <p className="text-xs text-slate-400">Consistency matters</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                      <span className="text-xl">🔥</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Calorie goals</div>
                      <div className="text-xs text-slate-400">Days on track</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">
                    {streak.calories}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                      <span className="text-xl">🌱</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Low carbon</div>
                      <div className="text-xs text-slate-400">Eco-friendly days</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {streak.carbon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hydration & BMI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Hydration Tracking */}
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white mb-1 tracking-wide uppercase">Hydration</h2>
                  <p className="text-xs text-slate-400">Daily Water Intake</p>
                </div>
                <Droplet className="text-blue-400" size={24} />
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">{waterIntake}</span>
                  <span className="text-sm text-slate-400">ml</span>
                </div>
                <div className="text-xs text-slate-400">
                  Goal: {goalWater}ml
                </div>
              </div>

              <div className="relative mb-4">
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${waterProgress}%`,
                      background: 'linear-gradient(to right, #3b82f6, #60a5fa)'
                    }}
                  />
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddWater(250)}
                  className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  +250ml
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  +500ml
                </button>
                <button
                  onClick={() => handleAddWater(750)}
                  className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  +750ml
                </button>
              </div>
            </div>
          </div>

          {/* BMI Display */}
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white mb-1 tracking-wide uppercase">BMI</h2>
                  <p className="text-xs text-slate-400">Body Mass Index</p>
                </div>
                <Activity className="text-purple-400" size={24} />
              </div>
              
              <div className="mb-6">
                {bmi > 0 ? (
                  <>
                    <div className="text-4xl font-bold text-white mb-2">{bmi}</div>
                    <div className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${bmiCategory.color.replace('text-', 'bg-')} ${bmiCategory.color}`}>
                      {bmiCategory.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-3">
                      {profile?.weight?.toFixed(1)}kg / {profile?.height?.toFixed(0)}cm
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-sm py-4">
                    Add height & weight in Profile to calculate BMI
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 sm:p-10 mb-6 border border-slate-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Leaf className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white mb-1 tracking-wide uppercase">Carbon Footprint</h2>
                  <p className="text-xs text-slate-400">Environmental Impact</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {dailyStats.total_carbon.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">kg CO₂</div>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${animatedProgress.carbon}%`,
                    background: 'linear-gradient(to right, #10b981, #34d399)'
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <span className={`text-sm font-medium ${carbonStatus.color}`}>
                {carbonStatus.text}
              </span>
            </div>
          </div>
        </div>

        {/* Smart Insight */}
        {smartInsight && (
          <div className="relative bg-gradient-to-br from-blue-950/30 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-blue-900/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="text-4xl">{smartInsight.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {smartInsight.text}
                </h3>
                <p className="text-sm text-slate-400">
                  {smartInsight.subtitle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Meals
              </h2>
              <p className="text-sm text-slate-400 mt-1">Today's nutrition</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddMealModal(true)}
                className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full hover:bg-white/15 transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Meal</span>
              </button>
              
              {/* Debug: Test meal addition */}
              <button 
                onClick={async () => {
                  try {
                    console.log('Testing meal addition...');
                    const testMeal = {
                      user_id: user?.id || '',
                      meal_type: 'breakfast',
                      food_items: ['Test Oatmeal', 'Test Banana'],
                      calories: 300,
                      protein_g: 10,
                      carbs_g: 50,
                      fats_g: 8,
                      carbon_kg: 0.5,
                      image_url: '',
                      date: new Date().toISOString().split('T')[0]
                    };
                    console.log('Test meal data:', testMeal);
                    await addMeal(testMeal);
                    console.log('Test meal added successfully!');
                    fetchData(); // Refresh the data
                    toast.success('Test meal added successfully!');
                  } catch (error) {
                    console.error('Error adding test meal:', error);
                    toast.error('Failed to add test meal');
                  }
                }}
                className="bg-yellow-500/20 backdrop-blur-sm text-yellow-400 px-3 py-2 rounded-full hover:bg-yellow-500/30 transition-all duration-200 font-medium border border-yellow-500/30 text-xs"
              >
                Test Meal
              </button>
            </div>
          </div>

        {meals.length === 0 ? (
          <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-800/50">
            <UtensilsCrossed className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">No meals today</h3>
            <p className="text-sm text-slate-400 mb-6">Start tracking your nutrition</p>
            <button 
              onClick={() => setShowAddMealModal(true)}
              className="bg-slate-800/50 backdrop-blur-sm text-white px-5 py-2.5 rounded-full hover:bg-slate-700/50 transition-all duration-200 font-medium border border-slate-700/50"
            >
              Add Your First Meal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onMealAdded={fetchData}
        userId={user?.id || ''}
      />
    </div>
  );
};

const MacroCard = ({ label, value, goal, percent, color, unit, trend }: {
  label: string;
  value: number;
  goal: number;
  percent: number;
  color: string;
  unit: string;
  trend: number[];
}) => {
  const [showWeekly, setShowWeekly] = useState(false);
  
  const colorMap = {
    blue: { 
      gradient: 'from-blue-950/20 to-transparent',
      ring: '#3b82f6',
      track: '#1e3a8a',
      border: 'border-blue-900/30',
      text: 'text-blue-400'
    },
    amber: { 
      gradient: 'from-amber-950/20 to-transparent',
      ring: '#f59e0b',
      track: '#78350f',
      border: 'border-amber-900/30',
      text: 'text-amber-400'
    },
    rose: { 
      gradient: 'from-rose-950/20 to-transparent',
      ring: '#f43f5e',
      track: '#881337',
      border: 'border-rose-900/30',
      text: 'text-rose-400'
    }
  };
  
  const colors = colorMap[color as keyof typeof colorMap];
  
  // Calculate weekly average and trend direction
  const weeklyAvg = Math.round(trend.reduce((a, b) => a + b, 0) / trend.length);
  // const weeklyPercent = Math.min((weeklyAvg / goal) * 100, 100);
  
  // Check if trending up (compare last 3 days to first 3 days)
  const firstHalf = trend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = trend.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const isTrendingUp = secondHalf > firstHalf;
  
  const displayValue = showWeekly ? weeklyAvg : value;
  // const displayPercent = showWeekly ? weeklyPercent : percent;
  
  return (
    <div 
      className={`relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/50 overflow-hidden cursor-pointer transition-all duration-300 hover:border-slate-700/50 hover:scale-[1.02]`}
      onClick={() => setShowWeekly(!showWeekly)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} pointer-events-none`}></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <p className="text-xs font-semibold text-white uppercase tracking-wide">{label}</p>
            <span className="text-xs text-slate-500">
              {showWeekly ? '(7d avg)' : '(today)'}
            </span>
          </div>
          
          <div className="relative">
            <div className={`transition-all duration-500 ${showWeekly ? 'opacity-0 scale-90 absolute inset-0' : 'opacity-100 scale-100'}`}>
              <AppleCircularProgress percent={percent} color={colors.ring} trackColor={colors.track} />
            </div>
            <div className={`transition-all duration-500 ${showWeekly ? 'opacity-100 scale-100' : 'opacity-0 scale-90 absolute inset-0'}`}>
              <WeeklyChart data={trend} color={colors.ring} goal={goal} isTrendingUp={isTrendingUp} />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1 transition-all duration-3000 ease-out">
            {displayValue}<span className="text-lg text-slate-400 font-normal ml-0.5">{unit}</span>
          </div>
          <div className="text-xs text-slate-400">
            of {goal}{unit}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800/50 text-center">
          <p className="text-xs text-slate-500">
            Tap to {showWeekly ? 'see today' : 'see weekly'}
          </p>
        </div>
      </div>
    </div>
  );
};

/*
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const width = 100;
  const height = 24;
  const padding = 2;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={width} height={height} className="mx-auto opacity-60">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-xs text-slate-500">7 day trend</p>
    </div>
  );
};
*/

const WeeklyChart = ({ data, color, goal, isTrendingUp }: { data: number[]; color: string; goal: number; isTrendingUp: boolean }) => {
  const size = 120;
  const padding = 10;
  const chartWidth = size - padding * 2;
  const chartHeight = size - padding * 2;
  
  const max = Math.max(...data, goal);
  const min = 0;
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  // Goal line y position
  const goalY = padding + chartHeight - ((goal - min) / range) * chartHeight;
  
  // Shaded area color based on trend
  const areaColor = isTrendingUp ? '#10b981' : '#ef4444'; // green for up, red for down
  
  // Create smooth curve path
  const createSmoothPath = () => {
    const dataPoints = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });
    
    if (dataPoints.length < 2) return points;
    
    let path = `M ${dataPoints[0].x} ${dataPoints[0].y}`;
    
    for (let i = 0; i < dataPoints.length - 1; i++) {
      const current = dataPoints[i];
      const next = dataPoints[i + 1];
      const midX = (current.x + next.x) / 2;
      
      path += ` Q ${current.x} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
      path += ` Q ${next.x} ${next.y}, ${next.x} ${next.y}`;
    }
    
    return path;
  };
  
  return (
    <div className="relative inline-flex">
      <svg width={size} height={size}>
        {/* Goal line */}
        <line
          x1={padding}
          y1={goalY}
          x2={size - padding}
          y2={goalY}
          stroke={color}
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.3"
        />
        
        {/* Area under curve - color based on trend */}
        <path
          d={`${createSmoothPath()} L ${size - padding} ${size - padding} L ${padding} ${size - padding} Z`}
          fill={areaColor}
          opacity="0.15"
        />
        
        {/* Line chart */}
        <path
          d={createSmoothPath()}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((value, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((value - min) / range) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              opacity={index === data.length - 1 ? "1" : "0.6"}
            />
          );
        })}
      </svg>
    </div>
  );
};

const AppleCircularProgress = ({ percent, color, trackColor }: {
  percent: number;
  color: string;
  trackColor: string;
}) => {
  const size = 120;
  const numSegments = 15;
  const segmentAngle = 360 / numSegments;
  const radius = size / 2 - 2;
  const barWidth = 5;
  const barHeight = 23;
  const tiltAngle = 12;
  
  const segments = [];
  for (let i = 0; i < numSegments; i++) {
    const angle = (i * segmentAngle) * Math.PI / 180;
    const outerRadius = radius;
    const innerRadius = radius - barHeight;
    
    const outerX = size / 2 + outerRadius * Math.cos(angle - Math.PI / 2);
    const outerY = size / 2 + outerRadius * Math.sin(angle - Math.PI / 2);
    const innerX = size / 2 + innerRadius * Math.cos(angle - Math.PI / 2);
    const innerY = size / 2 + innerRadius * Math.sin(angle - Math.PI / 2);
    
    const segmentPercent = ((i + 1) / numSegments) * 100;
    const isFilled = segmentPercent <= percent;
    
    // Draw rectangle pointing inward with tilt
    const dx = innerX - outerX;
    const dy = innerY - outerY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const rotatedAngle = Math.atan2(dy, dx) + (tiltAngle * Math.PI / 180);
    
    segments.push(
      <rect
        key={i}
        x={outerX}
        y={outerY}
        width={length}
        height={barWidth}
        fill={isFilled ? color : trackColor}
        rx={barWidth / 2}
        className="transition-all duration-3000 ease-out"
        opacity={isFilled ? 1 : 0.3}
        transform={`rotate(${rotatedAngle * 180 / Math.PI} ${outerX} ${outerY})`}
        style={{
          // filter: isFilled ? `drop-shadow(0 0 4px ${color})` : 'none',
          transformOrigin: `${outerX} ${outerY}`
        }}
      />
    );
  }
  
  return (
    <div className="relative inline-flex">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-white text-xl transition-all duration-3000 ease-out">
            {Math.round(percent)}%
          </span>
      </div>
    </div>
  );
};

const MealCard = ({ meal }: { meal: Meal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMealIcon = (type: string) => {
    const icons: Record<string, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  const getMealColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      lunch: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dinner: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      snack: 'bg-green-500/10 text-green-400 border-green-500/30'
    };
    return colors[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="group relative bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden hover:border-slate-700/50 hover:bg-slate-900/40 transition-all duration-200">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getMealIcon(meal.meal_type)}</div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">
              {meal.food_items && meal.food_items.length > 0 ? meal.food_items[0] : 'No food items'}
            </h3>
            {meal.food_items && meal.food_items.length > 1 && (
              <p className="text-sm text-slate-400">
                +{meal.food_items.length - 1} more item{meal.food_items.length - 1 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xl font-bold text-white">{meal.calories || 0} calories</div>
            <span className={`text-xs font-medium px-2 py-1 rounded-md border ${getMealColor(meal.meal_type)} mt-1 inline-block`}>
              {meal.meal_type.toUpperCase()}
            </span>
          </div>
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Content */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200 space-y-4">
          {/* Full Food Items List */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Food Items:</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {(meal.food_items || []).map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Nutrition Summary */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Nutrition:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {meal.protein_g?.toFixed(1) || 0}g
                  </div>
                  <div className="text-xs text-slate-400">Protein</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {meal.carbs_g?.toFixed(1) || 0}g
                  </div>
                  <div className="text-xs text-slate-400">Carbs</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {meal.fats_g?.toFixed(1) || 0}g
                  </div>
                  <div className="text-xs text-slate-400">Fats</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {meal.carbon_kg?.toFixed(2) || 0}kg
                  </div>
                  <div className="text-xs text-slate-400">CO₂</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sustainable Alternatives */}
          {(() => {
            const alternatives = getSustainableAlternatives(meal.food_items || []);
            if (alternatives.length > 0) {
              return (
                <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="text-emerald-400" size={18} />
                    <h4 className="text-sm font-semibold text-emerald-300">🌱 Sustainable Alternatives</h4>
                  </div>
                  <div className="space-y-3">
                    {alternatives.map((alt, index) => (
                      <div key={index} className="bg-slate-800/30 rounded-xl p-3 border border-emerald-700/20">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-slate-400">
                              <span className="line-through text-slate-500">{alt.original}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <ArrowRight className="text-emerald-400" size={14} />
                              <span className="text-sm font-semibold text-emerald-300">{alt.suggestion}</span>
                            </div>
                            {/* Dietary Type & Protein Badges */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                alt.dietaryType === 'vegan' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                alt.dietaryType === 'vegetarian' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                alt.dietaryType === 'pescatarian' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}>
                                {alt.dietaryType}
                              </span>
                              {alt.proteinRich && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  High Protein
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-emerald-400">
                              -{alt.carbonSaved.toFixed(1)}kg CO₂
                            </div>
                            <div className="text-xs text-emerald-400/70">saved</div>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-300/80 mt-2">{alt.healthBenefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};