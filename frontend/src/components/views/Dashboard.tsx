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
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  // Extract color value with futuristic glow
  const colorMap: Record<string, { main: string; glow: string; bg: string }> = {
    'bg-blue-500': { main: '#3b82f6', glow: '#60a5fa', bg: '#1e3a8a' },
    'bg-yellow-500': { main: '#eab308', glow: '#fde047', bg: '#a16207' },
    'bg-red-500': { main: '#ef4444', glow: '#f87171', bg: '#991b1b' },
  };
  const colors = colorMap[color] || colorMap['bg-blue-500'];
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors.glow}20 0%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />
      
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
        style={{ width: size, height: size }}
      >
        {/* Outer ring for depth */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          stroke={colors.bg}
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id={`bg-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.bg} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.bg} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`progress-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.main} stopOpacity="1" />
            <stop offset="50%" stopColor={colors.glow} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.main} stopOpacity="0.8" />
          </linearGradient>
          <filter id={`glow-${color}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#bg-${color})`}
          strokeWidth="6"
          fill="none"
        />
        
        {/* Progress circle with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#progress-${color})`}
          strokeWidth="6"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={`url(#glow-${color})`}
          className="transition-all duration-1500 ease-out"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
        
        {/* Inner highlight ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 3}
          stroke={colors.glow}
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
      </svg>
      
      {/* Percentage text in center with glow */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="relative">
          <span 
            className="text-white text-sm font-bold drop-shadow-lg"
            style={{
              textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}40`,
            }}
          >
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      
      {/* Animated dots around the circle */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const dotRadius = radius + 8;
          const x = size / 2 + dotRadius * Math.cos(angle);
          const y = size / 2 + dotRadius * Math.sin(angle);
          const opacity = (percent / 100) * 0.6;
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: x - 2,
                top: y - 2,
                backgroundColor: colors.glow,
                opacity: opacity,
                boxShadow: `0 0 6px ${colors.glow}`,
              }}
            />
          );
        })}
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