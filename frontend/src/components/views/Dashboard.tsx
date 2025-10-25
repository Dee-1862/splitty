import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { Plus, UtensilsCrossed, Flame, Leaf, Target } from 'lucide-react';
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
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current || !user) return; // Prevent multiple simultaneous fetches

    try {
      console.log('fetchData called, user ID:', user.id);
      fetchingRef.current = true;
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching data for date:', today);
      
      // Fetch user profile and today's meals in parallel
      const [profileData, mealsData] = await Promise.all([
        getProfile(user.id),
        getMeals(user.id, today)
      ]);

      console.log('Profile data:', profileData);
      console.log('Meals data:', mealsData);

      setProfile(profileData);
      setMeals(mealsData);

      // Calculate daily stats using the utility function
      const stats = calculateDailyStats(mealsData, profileData || {});
      console.log('Calculated stats:', stats);
      setDailyStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      fetchingRef.current = false;
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('Rendering dashboard with:', { 
    loading, 
    user: !!user, 
    mealsCount: meals.length, 
    profile: !!profile 
  });

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name || user?.email || 'User'}!
        </h1>
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
        <button 
          onClick={() => setShowAddMealModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
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
