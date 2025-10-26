import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Save } from 'lucide-react';
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
    goal_type: 'maintenance' as 'maintenance' | 'weight_loss' | 'weight_gain' | 'muscle_gain',
    target_weight: 0,
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

      // Add new goal - use profile weight as current weight
      const newGoal = await addUserGoal({
        user_id: user.id,
        goal_type: goalForm.goal_type,
        target_weight: goalForm.target_weight > 0 ? goalForm.target_weight : 0,
        current_weight: profile?.weight || 0,
        target_date: goalForm.target_date || '',
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
      [name]: name === 'target_weight' ? parseFloat(value) || 0 : name === 'target_date' ? value : value
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-300">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Minimal Header */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-start gap-4 mb-4">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors text-slate-400 hover:text-white shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
                Dietary Preferences
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">
                Set your nutrition and fitness goals
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Nutrition Goals */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Target className="text-emerald-400" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Nutrition Goals</h2>
              </div>
              
              <form onSubmit={handleNutritionSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                      Daily Calories
                    </label>
                    <input
                      type="number"
                      name="goal_calories"
                      value={nutritionForm.goal_calories}
                      onChange={handleNutritionChange}
                      className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-800/50 text-white text-lg font-semibold"
                      min="1000"
                      max="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      name="goal_protein"
                      value={nutritionForm.goal_protein}
                      onChange={handleNutritionChange}
                      className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-800/50 text-white text-lg font-semibold"
                      min="50"
                      max="300"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      name="goal_carbs"
                      value={nutritionForm.goal_carbs}
                      onChange={handleNutritionChange}
                      className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-800/50 text-white text-lg font-semibold"
                      min="50"
                      max="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      name="goal_fats"
                      value={nutritionForm.goal_fats}
                      onChange={handleNutritionChange}
                      className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-800/50 text-white text-lg font-semibold"
                      min="20"
                      max="200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-4 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg shadow-emerald-500/20"
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
          </div>

          {/* Fitness Goals */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Target className="text-blue-400" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Fitness Goals</h2>
              </div>
              
              <form onSubmit={handleGoalSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    Goal Type
                  </label>
                  <select
                    name="goal_type"
                    value={goalForm.goal_type}
                    onChange={handleGoalChange}
                    className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50 text-white text-lg font-semibold"
                  >
                    <option value="maintenance">Maintain Weight</option>
                    <option value="weight_loss">Lose Weight</option>
                    <option value="weight_gain">Gain Weight</option>
                    <option value="muscle_gain">Gain Muscle</option>
                  </select>
                </div>

                {goalForm.goal_type !== 'maintenance' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="target_weight"
                      value={goalForm.target_weight}
                      onChange={handleGoalChange}
                      className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50 text-white text-lg font-semibold"
                      min="30"
                      max="300"
                      step="0.1"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Current weight: {profile?.weight ? `${profile.weight} kg` : 'Not set in Profile'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                    Target Date
                  </label>
                  <input
                    type="date"
                    name="target_date"
                    value={goalForm.target_date}
                    onChange={handleGoalChange}
                    className="w-full p-4 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800/50 text-white text-lg font-semibold"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg shadow-blue-500/20"
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
      </div>
    </div>
  );
};
