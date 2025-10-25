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
      <div className="min-h-screen pt-20 pb-24">
        <LoadingSpinner />
      </div>
    );
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 90 && percent <= 110) return 'bg-green-500';
    if (percent > 110) return 'bg-red-500';
    return 'bg-primary-600';
  };

  const calorieProgress = Math.min((dailyStats.total_calories / dailyStats.goal_calories) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your daily nutrition</p>
      </div>

      {/* Progress Ring - Calories */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-3 rounded-full">
              <Flame className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Calories</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailyStats.total_calories} / {dailyStats.goal_calories}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {Math.round((dailyStats.total_calories / dailyStats.goal_calories) * 100)}%
            </p>
            <p className="text-sm text-gray-500">
              {dailyStats.total_calories < dailyStats.goal_calories 
                ? `${dailyStats.goal_calories - dailyStats.total_calories} remaining`
                : 'Goal reached!'}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${getProgressColor(calorieProgress)} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(calorieProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MacroCard
          name="Protein"
          current={dailyStats.total_protein}
          goal={dailyStats.goal_protein}
          unit="g"
          color="bg-blue-500"
        />
        <MacroCard
          name="Carbs"
          current={dailyStats.total_carbs}
          goal={dailyStats.goal_carbs}
          unit="g"
          color="bg-yellow-500"
        />
        <MacroCard
          name="Fats"
          current={dailyStats.total_fats}
          goal={dailyStats.goal_fats}
          unit="g"
          color="bg-red-500"
        />
      </div>

      {/* Carbon Footprint */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-md p-6 mb-4 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Leaf className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Carbon Footprint</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailyStats.total_carbon.toFixed(2)} kg CO₂
              </p>
            </div>
          </div>
          <Target className="text-green-600" size={32} />
        </div>
      </div>

      {/* Meals Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Today's Meals</h2>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={20} />
          Add Meal
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <UtensilsCrossed className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 mb-2">No meals logged today</p>
          <p className="text-sm text-gray-400">Start tracking your nutrition!</p>
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

const MacroCard = ({ name, current, goal, unit, color }: any) => {
  const percent = Math.min((current / goal) * 100, 100);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <p className="text-xs text-gray-600 mb-2">{name}</p>
      <p className="text-xl font-bold text-gray-900 mb-2">
        {Math.round(current)} / {goal}{unit}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="flex">
        <img
          src={meal.image_url || 'https://via.placeholder.com/120'}
          alt={meal.food_items.join(', ')}
          className="w-24 h-24 object-cover"
        />
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getMealIcon(meal.meal_type)}</span>
            <span className="font-semibold text-gray-900">
              {getMealLabel(meal.meal_type)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {meal.food_items.slice(0, 3).join(', ')}
            {meal.food_items.length > 3 && '...'}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-700">
              🔥 {meal.calories || 0} cal
            </span>
            <span className="text-gray-700">
              🥩 {meal.protein_g?.toFixed(0) || 0}g
            </span>
            <span className="text-gray-700">
              🌱 {meal.carbon_kg?.toFixed(2) || 0}kg CO₂
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
