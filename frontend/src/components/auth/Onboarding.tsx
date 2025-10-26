import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { updateProfile, addUserGoal } from '../../utils/database';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../AuthContext';

export const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activity_level: 'light',
    goal_type: 'maintenance',
    target_weight: ''
  });

  const totalSteps = 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.full_name) {
      setError('Please enter your full name');
      return;
    }
    if (currentStep === 2 && (!formData.age || !formData.gender || !formData.height || !formData.weight)) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate goal calories (simplified - using Mifflin-St Jeor)
      const age = parseInt(formData.age);
      const height = parseFloat(formData.height);
      const weight = parseFloat(formData.weight);
      
      // BMR calculation (simplified)
      let bmr = 0;
      if (formData.gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const tdee = Math.round(bmr * activityMultipliers[formData.activity_level as keyof typeof activityMultipliers]);
      
      // Set protein based on goal
      const proteinGoals = {
        maintenance: 1.6,
        weight_loss: 2.2,
        weight_gain: 2.2,
        muscle_gain: 2.2
      };
      
      const goalProtein = Math.round(weight * proteinGoals[formData.goal_type as keyof typeof proteinGoals]);

      // Update profile
      await updateProfile(user.id, {
        full_name: formData.full_name,
        goal_calories: tdee,
        goal_protein: goalProtein,
        goal_carbs: Math.round(tdee * 0.45),
        goal_fats: Math.round(tdee * 0.25)
      });

      // Create user goal
      if (formData.target_weight) {
        await addUserGoal({
          user_id: user.id,
          goal_type: formData.goal_type as any,
          target_weight: parseFloat(formData.target_weight),
          current_weight: weight,
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_active: true
        });
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md relative z-10">
        {/* Background decoration icons */}
        <div className="absolute inset-0 opacity-10 -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl">🥗</div>
          <div className="absolute top-40 right-16 text-5xl">🌿</div>
          <div className="absolute bottom-40 left-20 text-7xl">🥑</div>
          <div className="absolute bottom-20 right-10 text-6xl">🍎</div>
          <div className="absolute top-1/2 left-1/4 text-5xl">🥦</div>
          <div className="absolute top-1/3 right-1/3 text-4xl">🌱</div>
          <div className="absolute top-2/3 left-1/2 text-5xl">🥝</div>
          <div className="absolute bottom-1/4 right-1/4 text-6xl">🍃</div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
            <span className="text-5xl">👋</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {currentStep === 1 && 'Welcome to MindMeal!'}
            {currentStep === 2 && "Let's Get Personal"}
            {currentStep === 3 && 'Set Your Goals'}
          </h1>
          <p className="text-gray-400">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 p-8">
          {currentStep === 1 && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                What's your full name?
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-gray-500 hover:border-gray-600"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2.5">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-gray-500 hover:border-gray-600"
                  placeholder="25"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all hover:border-gray-600"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-gray-500 hover:border-gray-600"
                    placeholder="170"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-gray-500 hover:border-gray-600"
                    placeholder="70"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2.5">Activity Level</label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all hover:border-gray-600"
                  required
                >
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="light">Light (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                  <option value="active">Active (hard exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (physical job + exercise)</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2.5">Fitness Goal</label>
                <select
                  name="goal_type"
                  value={formData.goal_type}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all hover:border-gray-600"
                  required
                >
                  <option value="maintenance">Maintain current weight</option>
                  <option value="weight_loss">Lose weight</option>
                  <option value="weight_gain">Gain weight</option>
                  <option value="muscle_gain">Build muscle</option>
                </select>
              </div>

              {formData.goal_type !== 'maintenance' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="target_weight"
                    value={formData.target_weight}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-gray-500 hover:border-gray-600"
                    placeholder={formData.weight || "70"}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 py-3.5 border-2 border-gray-700 text-gray-300 rounded-xl hover:border-gray-600 hover:text-white transition-all font-semibold"
              >
                Back
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 