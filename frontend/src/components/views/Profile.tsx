import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Target, TrendingUp, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { 
  getProfile, 
  getMeals, 
  getUserGoals, 
  calculateDayStreak,
  calculateTotalCarbonSaved,
  calculateWeeklyAverageCalories,
  calculateAverageProtein,
  type Profile, 
  type Meal, 
  type UserGoal 
} from '../../utils/database';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [stats, setStats] = useState({
    dayStreak: 0,
    mealsLogged: 0,
    carbonSaved: 0,
    weeklyAvgCalories: 0,
    avgProtein: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user?.id]); // Only re-run when user ID changes, not on every user object change

  const fetchProfileData = async () => {
    if (fetching) return; // Prevent multiple simultaneous fetches
    
    try {
      console.log('Fetching profile data for user:', user?.id);
      setLoading(true);
      setFetching(true);
      
      const [profileData, mealsData, goalsData] = await Promise.all([
        getProfile(user!.id),
        getMeals(user!.id),
        getUserGoals(user!.id)
      ]);

      console.log('Profile data:', profileData);
      console.log('Meals data:', mealsData);
      console.log('Goals data:', goalsData);

      setProfile(profileData);
      setMeals(mealsData);
      setGoals(goalsData);

      // Calculate stats
      const dayStreak = calculateDayStreak(mealsData);
      const carbonSaved = calculateTotalCarbonSaved(mealsData);
      const weeklyAvgCalories = calculateWeeklyAverageCalories(mealsData);
      const avgProtein = calculateAverageProtein(mealsData);

      console.log('Calculated stats:', { dayStreak, carbonSaved, weeklyAvgCalories, avgProtein });

      setStats({
        dayStreak,
        mealsLogged: mealsData.length,
        carbonSaved,
        weeklyAvgCalories,
        avgProtein
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('Profile component render:', { 
    loading, 
    user: !!user, 
    profile: !!profile,
    mealsCount: meals.length,
    goalsCount: goals.length,
    stats
  });

  const activeGoal = goals.find(goal => goal.is_active);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-6 mb-4 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="text-primary-600" size={40} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name || user?.email || 'User'}</h1>
            <p className="text-primary-100">{profile?.email || user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.dayStreak}</p>
            <p className="text-xs text-primary-100">Day Streak</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.mealsLogged}</p>
            <p className="text-xs text-primary-100">Meals Logged</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.carbonSaved.toFixed(1)}</p>
            <p className="text-xs text-primary-100">kg CO₂ Saved</p>
          </div>
        </div>
      </div>

      {/* Goals Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-primary-600" size={24} />
          <h2 className="text-lg font-semibold">My Goals</h2>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <p className="font-semibold text-gray-900 mb-1">Calorie Goal</p>
            <p className="text-sm text-gray-600">{profile?.goal_calories || 2000} cal/day</p>
          </div>
          {activeGoal && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <p className="font-semibold text-gray-900 mb-1">Fitness Goal</p>
              <p className="text-sm text-gray-600 capitalize">{activeGoal.goal_type.replace('_', ' ')}</p>
              {activeGoal.target_weight && (
                <p className="text-xs text-gray-500 mt-1">
                  Target: {activeGoal.target_weight}kg
                  {activeGoal.current_weight && ` (Current: ${activeGoal.current_weight}kg)`}
                </p>
              )}
            </div>
          )}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
            <p className="font-semibold text-gray-900 mb-1">Sustainability Goal</p>
            <p className="text-sm text-gray-600">Reduce carbon footprint</p>
          </div>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-primary-600" size={24} />
          <h2 className="text-lg font-semibold">Analytics</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Weekly Average</span>
              <span className="text-sm font-semibold">{stats.weeklyAvgCalories} cal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min((stats.weeklyAvgCalories / (profile?.goal_calories || 2000)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Protein Intake</span>
              <span className="text-sm font-semibold">{stats.avgProtein}g avg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min((stats.avgProtein / (profile?.goal_protein || 150)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-primary-600" size={24} />
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/edit-profile')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Edit Profile</p>
            <p className="text-sm text-gray-500">Update personal information</p>
          </button>
          <button 
            onClick={() => navigate('/dietary-preferences')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Dietary Preferences</p>
            <p className="text-sm text-gray-500">Manage goals and nutrition targets</p>
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Notification Settings</p>
            <p className="text-sm text-gray-500">Customize reminders</p>
          </button>
          <button 
            onClick={() => navigate('/privacy')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Privacy & Security</p>
            <p className="text-sm text-gray-500">Manage your data and privacy</p>
          </button>
        </div>
      </div>

      {/* Meal History */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-primary-600" size={24} />
          <h2 className="text-lg font-semibold">Recent Meals</h2>
        </div>
        <div className="space-y-3">
          {meals.slice(0, 5).map((meal) => {
            const getMealIcon = (type: string) => {
              const icons: Record<string, string> = {
                breakfast: '🌅',
                lunch: '☀️',
                dinner: '🌙',
                snack: '🍎'
              };
              return icons[type] || '🍽️';
            };

            const formatDate = (dateStr: string) => {
              const date = new Date(dateStr);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - date.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) return 'Today';
              if (diffDays === 2) return 'Yesterday';
              return `${diffDays - 1} days ago`;
            };

            return (
              <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl">{getMealIcon(meal.meal_type)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {meal.food_items.slice(0, 2).join(', ')}
                    {meal.food_items.length > 2 && '...'}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(meal.date)}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{meal.calories} cal</span>
              </div>
            );
          })}
          {meals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No meals logged yet</p>
              <p className="text-sm">Start tracking your nutrition!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
