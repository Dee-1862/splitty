import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Save, Plus } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { 
  getProfile, 
  updateProfile, 
  getUserGoals, 
  addUserGoal, 
  updateUserGoal,
  type Profile, 
  type UserGoal 
} from '../../utils/database';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

export const DietaryPreferences: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchingRef = useRef(false);
  
  // Nutrition goals form
  const [nutritionForm, setNutritionForm] = useState({
    goal_calories: 2000,
    goal_protein: 150,
    goal_carbs: 250,
    goal_fats: 67
  });

  // Fitness goal form
  const [goalForm, setGoalForm] = useState({
    goal_type: 'maintenance' as const,
    target_weight: 0,
    current_weight: 0,
    target_date: ''
  });

  const fetchData = useCallback(async () => {
    if (fetchingRef.current || !user) return; // Prevent multiple simultaneous fetches

    try {
      console.log('fetchData called, user ID:', user.id);
      fetchingRef.current = true;
      setLoading(true);
      const [profileData, goalsData] = await Promise.all([
        getProfile(user.id),
        getUserGoals(user.id)
      ]);

      if (profileData) {
        setProfile(profileData);
        setNutritionForm({
          goal_calories: profileData.goal_calories || 2000,
          goal_protein: profileData.goal_protein || 150,
          goal_carbs: profileData.goal_carbs || 250,
          goal_fats: profileData.goal_fats || 67
        });
      }

      setGoals(goalsData);
      
      // Set form with active goal if exists
      const activeGoal = goalsData.find(goal => goal.is_active);
      if (activeGoal) {
        setGoalForm({
          goal_type: activeGoal.goal_type,
          target_weight: activeGoal.target_weight || 0,
          current_weight: activeGoal.current_weight || 0,
          target_date: activeGoal.target_date || ''
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load preferences');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id]); // Only depend on user ID

  useEffect(() => {
    console.log('DietaryPreferences useEffect triggered, user:', user);
    if (user) {
      console.log('User found, fetching data...');
      fetchData();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user?.id, fetchData]); // Include fetchData in dependencies

  const handleNutritionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    try {
      setSaving(true);
      const updatedProfile = await updateProfile(user.id, nutritionForm);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success('Nutrition goals updated successfully!');
      } else {
        toast.error('Failed to update nutrition goals');
      }
    } catch (error) {
      console.error('Error updating nutrition goals:', error);
      toast.error('Failed to update nutrition goals');
    } finally {
      setSaving(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      
      // Deactivate existing goals
      const existingGoals = goals.filter(goal => goal.is_active);
      for (const goal of existingGoals) {
        await updateUserGoal(goal.id, { is_active: false });
      }

      // Add new goal
      const newGoal = await addUserGoal({
        user_id: user.id,
        goal_type: goalForm.goal_type,
        target_weight: goalForm.target_weight || null,
        current_weight: goalForm.current_weight || null,
        target_date: goalForm.target_date || null,
        is_active: true
      });

      if (newGoal) {
        setGoals(prev => [newGoal, ...prev.filter(g => !g.is_active)]);
        toast.success('Fitness goal updated successfully!');
      } else {
        toast.error('Failed to update fitness goal');
      }
    } catch (error) {
      console.error('Error updating fitness goal:', error);
      toast.error('Failed to update fitness goal');
    } finally {
      setSaving(false);
    }
  };

  const handleNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNutritionForm(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGoalForm(prev => ({
      ...prev,
      [name]: name.includes('weight') || name === 'target_date' ? value : value
    }));
  };

  // Debug info
  console.log('Rendering DietaryPreferences with:', { 
    loading, 
    user: !!user, 
    profile: !!profile,
    fetching: fetchingRef.current
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Dietary Preferences</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Nutrition Goals */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary-600" size={24} />
            <h2 className="text-lg font-semibold">Nutrition Goals</h2>
          </div>
          
          <form onSubmit={handleNutritionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Calories
                </label>
                <input
                  type="number"
                  name="goal_calories"
                  value={nutritionForm.goal_calories}
                  onChange={handleNutritionChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1000"
                  max="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  name="goal_protein"
                  value={nutritionForm.goal_protein}
                  onChange={handleNutritionChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="50"
                  max="300"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  name="goal_carbs"
                  value={nutritionForm.goal_carbs}
                  onChange={handleNutritionChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="50"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fats (g)
                </label>
                <input
                  type="number"
                  name="goal_fats"
                  value={nutritionForm.goal_fats}
                  onChange={handleNutritionChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="20"
                  max="200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Nutrition Goals
                </>
              )}
            </button>
          </form>
        </div>

        {/* Fitness Goals */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary-600" size={24} />
            <h2 className="text-lg font-semibold">Fitness Goals</h2>
          </div>
          
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Type
              </label>
              <select
                name="goal_type"
                value={goalForm.goal_type}
                onChange={handleGoalChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="maintenance">Maintain Weight</option>
                <option value="weight_loss">Lose Weight</option>
                <option value="weight_gain">Gain Weight</option>
                <option value="muscle_gain">Gain Muscle</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  name="current_weight"
                  value={goalForm.current_weight}
                  onChange={handleGoalChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  name="target_weight"
                  value={goalForm.target_weight}
                  onChange={handleGoalChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                name="target_date"
                value={goalForm.target_date}
                onChange={handleGoalChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Fitness Goal
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
