import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { Plus, UtensilsCrossed, Leaf, Target } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getMeals, getProfile, calculateDailyStats, type Meal, type Profile } from '../../utils/database';
import { AddMealModal } from './AddMealModal';

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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
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
  const fetchingRef = useRef(false); // Use useRef for fetching state

  const fetchData = useCallback(async () => {
    if (fetchingRef.current || !user) return; // Prevent multiple simultaneous fetches

    try {
      console.log('fetchData called, user ID:', user.id);
      fetchingRef.current = true; // Set fetching to true via ref
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching data for date:', today);

      const [profileData, mealsData] = await Promise.all([
        getProfile(user.id),
        getMeals(user.id, today)
      ]);

      console.log('Profile data:', profileData);
      console.log('Meals data:', mealsData);

      setProfile(profileData);
      setMeals(mealsData);

      const stats = calculateDailyStats(mealsData, profileData || {});
      console.log('Calculated stats:', stats);
      setDailyStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      fetchingRef.current = false; // Reset fetching via ref
    }
  }, [user?.id]); // Only depend on user ID

  useEffect(() => {
    console.log('Dashboard useEffect triggered, user:', user);
    if (user) {
      console.log('User found, fetching data...');
      fetchData();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user?.id, fetchData]); // Include fetchData in dependencies

  const calorieProgress = Math.min((dailyStats.total_calories / dailyStats.goal_calories) * 100, 100);
  const proteinProgress = Math.min((dailyStats.total_protein / dailyStats.goal_protein) * 100, 100);
  const carbsProgress = Math.min((dailyStats.total_carbs / dailyStats.goal_carbs) * 100, 100);
  const fatsProgress = Math.min((dailyStats.total_fats / dailyStats.goal_fats) * 100, 100);

  // Animate progress bars when component mounts
  useEffect(() => {
    if (loading) return;
    
    setAnimatedProgress({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    
    const timer = setTimeout(() => {
      setAnimatedProgress({
        calories: calorieProgress,
        protein: proteinProgress,
        carbs: carbsProgress,
        fats: fatsProgress
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [calorieProgress, proteinProgress, carbsProgress, fatsProgress, loading]);

  // Get status message
  const getCalorieStatus = () => {
    const percent = calorieProgress;
    if (percent < 10) return { text: "Just getting started! 🌱", color: "text-gray-400" };
    if (percent < 50) return { text: "Good progress 💪", color: "text-blue-400" };
    if (percent < 90) return { text: "Almost there! 🎯", color: "text-yellow-400" };
    if (percent < 100) return { text: "Nearly perfect! ⭐", color: "text-green-400" };
    return { text: "Goal achieved! 🎉", color: "text-green-400" };
  };

  const getCarbonStatus = () => {
    const kg = dailyStats.total_carbon;
    if (kg < 1) return { text: "Eco champion! 🌟", color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/30" };
    if (kg < 3) return { text: "Great choices 🌿", color: "text-green-400", bgColor: "bg-green-500/20", borderColor: "border-green-500/30" };
    if (kg < 5) return { text: "Stay mindful 🌱", color: "text-yellow-400", bgColor: "bg-yellow-500/20", borderColor: "border-yellow-500/30" };
    return { text: "Try alternatives 🔄", color: "text-orange-400", bgColor: "bg-orange-500/20", borderColor: "border-orange-500/30" };
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }
  
  console.log('Rendering dashboard with:', {
    loading,
    user: !!user,
    mealsCount: meals.length,
    profile: !!profile,
    fetching: fetchingRef.current
  });

  const calorieStatus = getCalorieStatus();
  const carbonStatus = getCarbonStatus();

  // Get current date formatted
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-24 px-4 max-w-2xl mx-auto">
      {/* Header with Date */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">📅 {dateString}</p>
        <h1 className="text-3xl font-bold text-white mb-1">Your Day Today</h1>
        <p className="text-gray-400">Track your daily nutrition</p>
      </div>

      {/* Progress Ring - Calories */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 mb-4 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <p className="text-white text-sm font-medium">CALORIES</p>
          <span className={`text-sm font-bold ${calorieStatus.color}`}>
            {Math.round(calorieProgress)}%
          </span>
        </div>
        
        {/* Calories Count - Bigger consumed value */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-5xl font-bold text-white">
            {dailyStats.total_calories}
          </span>
          <span className="text-3xl text-gray-600">/</span>
          <span className="text-3xl text-gray-500">
            {dailyStats.goal_calories}
          </span>
          <span className="text-xl text-gray-500">cal</span>
        </div>
        
        {/* Progress Bar - Segmented (40 segments) */}
        <div className="flex gap-0.5">
          {Array.from({ length: 40 }).map((_, i) => {
            const segmentPercent = (i + 1) * 2.5; // Each segment is 2.5%
            const isFilled = segmentPercent <= animatedProgress.calories;
            return (
              <div
                key={i}
                className={`flex-1 h-6 rounded-sm transition-all duration-20000 ease-out ${
                  isFilled ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            );
          })}
        </div>

        {/* Status Message */}
        <p className={`text-sm mt-3 text-center ${calorieStatus.color}`}>
          {calorieStatus.text}
        </p>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Protein */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-white text-xs font-medium">Protein</p>
            </div>
            <CircularProgressMacro
              percent={animatedProgress.protein}
              color="bg-blue-500"
              size={80}
            />
            <p className="text-white text-sm font-semibold mt-3 text-center">
              {Math.round(dailyStats.total_protein)} / {dailyStats.goal_protein}g
            </p>
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-white text-xs font-medium">Carbs</p>
            </div>
            <CircularProgressMacro
              percent={animatedProgress.carbs}
              color="bg-yellow-500"
              size={80}
            />
            <p className="text-white text-sm font-semibold mt-3 text-center">
              {Math.round(dailyStats.total_carbs)} / {dailyStats.goal_carbs}g
            </p>
          </div>
        </div>

        {/* Fats */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-white text-xs font-medium">Fats</p>
            </div>
            <CircularProgressMacro
              percent={animatedProgress.fats}
              color="bg-red-500"
              size={80}
            />
            <p className="text-white text-sm font-semibold mt-3 text-center">
              {Math.round(dailyStats.total_fats)} / {dailyStats.goal_fats}g
            </p>
          </div>
        </div>
      </div>

      {/* Carbon Footprint */}
      <div className={`bg-gray-900 rounded-2xl shadow-lg p-6 mb-4 border ${carbonStatus.borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${carbonStatus.bgColor} rounded-xl flex items-center justify-center`}>
              <Leaf className={carbonStatus.color} size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Carbon Footprint</p>
              <p className="text-2xl font-bold text-white">
                {dailyStats.total_carbon.toFixed(2)} kg
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Daily Budget</p>
            <p className="text-sm font-medium text-gray-400">5.0 kg</p>
          </div>
        </div>

                                   {/* Progress Bar - Segmented */}
         <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
           {/* Background segments */}
           <div className="absolute inset-0 flex">
             <div className="w-1/3 bg-gray-700 border-r border-gray-600"></div>
             <div className="w-1/3 bg-gray-700 border-r border-gray-600"></div>
             <div className="w-1/3 bg-gray-700"></div>
           </div>
           {/* Filled bar with color gradient */}
           <div 
             className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
             style={{ 
               width: `${Math.min((dailyStats.total_carbon / 5) * 100, 100)}%`,
               background: (() => {
                 const percent = (dailyStats.total_carbon / 5) * 100;
                 if (percent <= 33) {
                   // Green in first third
                   return 'linear-gradient(to right, #4ade80, #22c55e)';
                 } else if (percent <= 66) {
                   // Green to yellow in second third
                   return 'linear-gradient(to right, #4ade80, #22c55e, #eab308, #facc15)';
                 } else {
                   // Green to yellow to red in third section
                   return 'linear-gradient(to right, #4ade80, #22c55e, #eab308, #facc15, #f87171, #ef4444)';
                 }
               })()
             }}
           />
           {/* Segment divider bars */}
           <div className="absolute top-0 left-1/3 h-full w-px bg-gray-600"></div>
           <div className="absolute top-0 left-2/3 h-full w-px bg-gray-600"></div>
         </div>

        {/* Status Badge */}
        <div className="text-center">
          <span className={`text-xs ${carbonStatus.color} ${carbonStatus.bgColor} px-4 py-2 rounded-full border ${carbonStatus.borderColor}`}>
            {carbonStatus.text}
          </span>
        </div>
      </div>

      {/* Meals Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white">Today's Meals</h2>
        <button 
          onClick={() => setShowAddMealModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Meal
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center">
          <UtensilsCrossed className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-white/60 mb-2 font-medium">No meals logged today</p>
          <p className="text-sm text-gray-500">Start tracking your nutrition!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}

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

const CircularProgressMacro = ({ percent, color, size }: { percent: number; color: string; size: number }) => {
  const numSegments = 18;
  const segmentAngle = 360 / numSegments;
  const radius = size / 2 - 2;
  const barWidth = 5;
  const barHeight = 15;
  const tiltAngle = 15; // Tilt bars 12 degrees
  
  // Color mapping
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-yellow-500': '#eab308',
    'bg-red-500': '#ef4444',
  };
  const fillColor = colorMap[color] || '#3b82f6';
  
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
          fill={isFilled ? fillColor : '#374151'}
          rx={barWidth / 2}
          className="transition-all duration-1000 ease-out"
          opacity={isFilled ? 1 : 0.3}
          transform={`rotate(${rotatedAngle * 180 / Math.PI} ${outerX} ${outerY})`}
        />
      );
  }
  
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
};

const MealCard = ({ meal }: { meal: Meal }) => {
  const getMealIcon = (type: string) => {
    const icons: Record<string, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  const getMealLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-gray-900 rounded-2xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{getMealIcon(meal.meal_type)}</span>
        <span className="font-semibold text-white">
          {getMealLabel(meal.meal_type)}
        </span>
      </div>
      <p className="text-sm text-white/60 mb-3">
        {meal.food_items.slice(0, 3).join(', ')}
        {meal.food_items.length > 3 && '...'}
      </p>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-white/80">
          🔥 {meal.calories || 0} cal
        </span>
        <span className="text-white/80">
          🥩 {meal.protein_g?.toFixed(0) || 0}g
        </span>
        <span className="text-white/80">
          🌱 {meal.carbon_kg?.toFixed(2) || 0}kg CO₂
        </span>
      </div>
    </div>
  );
};