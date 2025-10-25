import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../supabase';
import { Plus, UtensilsCrossed, Flame, Leaf, Target } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Meal {
  id: string;
  meal_type: string;
  image_url: string;
  food_items: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  carbon_kg: number;
  date: string;
}

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
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    total_calories: 1650,
    total_protein: 120,
    total_carbs: 180,
    total_fats: 55,
    total_carbon: 2.8,
    goal_calories: 2000,
    goal_protein: 150,
    goal_carbs: 250,
    goal_fats: 67
  });

  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMeals(data || []);

      // Calculate daily totals
      const totals = data?.reduce((acc, meal) => ({
        total_calories: acc.total_calories + (meal.calories || 0),
        total_protein: acc.total_protein + (meal.protein_g || 0),
        total_carbs: acc.total_carbs + (meal.carbs_g || 0),
        total_fats: acc.total_fats + (meal.fats_g || 0),
        total_carbon: acc.total_carbon + (meal.carbon_kg || 0),
        goal_calories: acc.goal_calories,
        goal_protein: acc.goal_protein,
        goal_carbs: acc.goal_carbs,
        goal_fats: acc.goal_fats
      }), dailyStats) || dailyStats;

      setDailyStats(totals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  const calorieProgress = Math.min((dailyStats.total_calories / dailyStats.goal_calories) * 100, 100);
  const proteinProgress = Math.min((dailyStats.total_protein / dailyStats.goal_protein) * 100, 100);
  const carbsProgress = Math.min((dailyStats.total_carbs / dailyStats.goal_carbs) * 100, 100);
  const fatsProgress = Math.min((dailyStats.total_fats / dailyStats.goal_fats) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Your Day Today</h1>
        <p className="text-white/60">Track your daily nutrition</p>
      </div>

      {/* Progress Ring - Calories */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <p className="text-white text-sm font-medium">CALORIES</p>
        </div>
        
        {/* Calories Count */}
        <p className="text-white text-2xl font-bold mb-4">
          {dailyStats.total_calories} / {dailyStats.goal_calories} cal
        </p>
        
        {/* Progress Bar - Segmented (40 segments) */}
        <div className="flex gap-0.5">
          {Array.from({ length: 40 }).map((_, i) => {
            const segmentPercent = (i + 1) * 2.5; // Each segment is 2.5%
            const isFilled = segmentPercent <= calorieProgress;
            return (
              <div
                key={i}
                className={`flex-1 h-2.5 rounded-sm transition-all duration-500 ${
                  isFilled ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            );
          })}
        </div>
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
              percent={proteinProgress}
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
              percent={carbsProgress}
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
              percent={fatsProgress}
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
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="text-green-500" size={24} />
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Carbon Footprint</p>
              <p className="text-xl font-bold text-white">
                {dailyStats.total_carbon.toFixed(2)} kg CO₂
              </p>
            </div>
          </div>
          <Target className="text-green-500" size={24} />
        </div>
      </div>

      {/* Meals Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white">Today's Meals</h2>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
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
    </div>
  );
};

const CircularProgressMacro = ({ percent, color, size }: { percent: number; color: string; size: number }) => {
  const numSegments = 20;
  const segmentAngle = 360 / numSegments;
  const radius = size / 2 - 10;
  const barWidth = 3;
  const barHeight = 6;
  
  // Extract color value
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-yellow-500': '#eab308',
    'bg-red-500': '#ef4444',
  };
  const fillColor = colorMap[color] || '#3b82f6';
  
  const segments = [];
  for (let i = 0; i < numSegments; i++) {
    const angle = ((i * segmentAngle - 90) * Math.PI) / 180;
    const x = size / 2 + (radius) * Math.cos(angle);
    const y = size / 2 + (radius) * Math.sin(angle);
    const rotation = i * segmentAngle;
    
    const segmentPercent = ((i + 1) / numSegments) * 100;
    const isFilled = segmentPercent <= percent;
    
    segments.push(
      <rect
        key={i}
        x={x - barWidth / 2}
        y={y - barHeight / 2}
        width={barWidth}
        height={barHeight}
        fill={isFilled ? fillColor : '#374151'}
        transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
        rx={1}
        className="transition-all duration-500"
      />
    );
  }
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments}
    </svg>
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
