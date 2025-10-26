import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, User, Bell, Shield, Settings, TrendingUp, Award, Calendar } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { 
  getProfile, 
  getMeals, 
  getUserGoals, 
  calculateDayStreak,
  calculateTotalCarbonSaved,
  calculateWeeklyAverageCalories,
  calculateAverageProtein,
  type Profile as ProfileType, 
  type Meal, 
  type UserGoal 
} from '../../utils/database';
import { supabase } from '../../supabase';

// Pixelated character components for display
const CHARACTER_COMPONENTS: Record<string, React.ReactNode> = {
  pixel_wizard: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="15" width="40" height="8" fill="#8b5cf6" className="animate-pulse" />
      <rect x="25" y="20" width="50" height="6" fill="#7c3aed" className="animate-pulse" />
      <rect x="20" y="23" width="60" height="4" fill="#6d28d9" className="animate-pulse" />
      <rect x="45" y="10" width="10" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="47" y="8" width="6" height="14" fill="#fbbf24" className="animate-pulse" />
      <rect x="42" y="13" width="16" height="4" fill="#fbbf24" className="animate-pulse" />
      <rect x="35" y="30" width="30" height="25" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="35" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="35" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="42" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="50" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="52" width="40" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="30" y="58" width="40" height="25" fill="#3b82f6" className="animate-pulse" />
      <rect x="75" y="20" width="4" height="60" fill="#8b5cf6" className="animate-pulse" />
      <rect x="70" y="15" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="15" y="25" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="85" y="35" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="10" y="45" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
    </svg>
  ),
  pixel_knight: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="20" width="40" height="20" fill="#6b7280" className="animate-pulse" />
      <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="40" y="25" width="20" height="6" fill="#1f2937" className="animate-pulse" />
      <rect x="42" y="27" width="16" height="2" fill="#374151" className="animate-pulse" />
      <rect x="45" y="28" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="52" y="28" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="25" y="40" width="50" height="30" fill="#374151" className="animate-pulse" />
      <rect x="30" y="45" width="40" height="4" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="55" width="40" height="4" fill="#6b7280" className="animate-pulse" />
      <rect x="15" y="45" width="12" height="20" fill="#dc2626" className="animate-pulse" />
      <rect x="17" y="47" width="8" height="16" fill="#ef4444" className="animate-pulse" />
      <rect x="19" y="50" width="4" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="35" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="25" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="23" width="10" height="4" fill="#f59e0b" className="animate-pulse" />
    </svg>
  ),
  pixel_ninja: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="35" y="25" width="30" height="20" fill="#1f2937" className="animate-pulse" />
      <rect x="30" y="20" width="40" height="8" fill="#374151" className="animate-pulse" />
      <rect x="40" y="30" width="4" height="4" fill="#ef4444" className="animate-pulse" />
      <rect x="56" y="30" width="4" height="4" fill="#ef4444" className="animate-pulse" />
      <rect x="30" y="45" width="40" height="30" fill="#1f2937" className="animate-pulse" />
      <rect x="25" y="50" width="50" height="6" fill="#dc2626" className="animate-pulse" />
      <rect x="27" y="52" width="46" height="2" fill="#ef4444" className="animate-pulse" />
      <rect x="75" y="20" width="3" height="50" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="15" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="13" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="15" y="30" width="8" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="17" y="28" width="4" height="12" fill="#6b7280" className="animate-pulse" />
      <rect x="13" y="32" width="12" height="4" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="15" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
      <rect x="85" y="25" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
      <rect x="5" y="35" width="3" height="3" fill="#9ca3af" className="animate-pulse" />
    </svg>
  ),
  pixel_robot: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="20" width="40" height="25" fill="#6b7280" className="animate-pulse" />
      <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="48" y="10" width="4" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="46" y="8" width="8" height="4" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="28" width="6" height="6" fill="#10b981" className="animate-pulse" />
      <rect x="54" y="28" width="6" height="6" fill="#10b981" className="animate-pulse" />
      <rect x="42" y="30" width="2" height="2" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="30" width="2" height="2" fill="#1f2937" className="animate-pulse" />
      <rect x="45" y="38" width="10" height="3" fill="#ef4444" className="animate-pulse" />
      <rect x="25" y="45" width="50" height="35" fill="#374151" className="animate-pulse" />
      <rect x="35" y="50" width="30" height="15" fill="#1f2937" className="animate-pulse" />
      <rect x="40" y="55" width="20" height="5" fill="#10b981" className="animate-pulse" />
      <rect x="42" y="57" width="16" height="1" fill="#1f2937" className="animate-pulse" />
      <rect x="15" y="50" width="12" height="20" fill="#6b7280" className="animate-pulse" />
      <rect x="73" y="50" width="12" height="20" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="65" width="8" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="82" y="65" width="8" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="35" y="80" width="12" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="53" y="80" width="12" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="32" y="92" width="18" height="6" fill="#4b5563" className="animate-pulse" />
      <rect x="50" y="92" width="18" height="6" fill="#4b5563" className="animate-pulse" />
    </svg>
  ),
  pixel_archer: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="40" y="15" width="20" height="15" fill="#7c2d12" className="animate-pulse" />
      <rect x="42" y="12" width="16" height="6" fill="#92400e" className="animate-pulse" />
      <rect x="55" y="10" width="8" height="12" fill="#dc2626" className="animate-pulse" />
      <rect x="57" y="8" width="4" height="16" fill="#ef4444" className="animate-pulse" />
      <rect x="35" y="30" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="35" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="57" y="35" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="42" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="53" width="40" height="25" fill="#059669" className="animate-pulse" />
      <rect x="15" y="40" width="12" height="25" fill="#7c2d12" className="animate-pulse" />
      <rect x="17" y="42" width="8" height="21" fill="#92400e" className="animate-pulse" />
      <rect x="18" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="21" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="24" y="35" width="2" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="40" fill="#7c2d12" className="animate-pulse" />
      <rect x="70" y="35" width="14" height="4" fill="#92400e" className="animate-pulse" />
      <rect x="72" y="33" width="10" height="8" fill="#7c2d12" className="animate-pulse" />
      <rect x="76" y="32" width="2" height="36" fill="#1f2937" className="animate-pulse" />
    </svg>
  ),
  pixel_mage: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="10" width="40" height="12" fill="#7c3aed" className="animate-pulse" />
      <rect x="25" y="18" width="50" height="8" fill="#6d28d9" className="animate-pulse" />
      <rect x="20" y="22" width="60" height="6" fill="#5b21b6" className="animate-pulse" />
      <rect x="45" y="5" width="10" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="47" y="3" width="6" height="14" fill="#fbbf24" className="animate-pulse" />
      <rect x="42" y="8" width="16" height="4" fill="#fbbf24" className="animate-pulse" />
      <rect x="35" y="28" width="30" height="22" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="47" width="40" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="25" y="50" width="50" height="35" fill="#3b82f6" className="animate-pulse" />
      <rect x="75" y="15" width="4" height="70" fill="#8b5cf6" className="animate-pulse" />
      <rect x="70" y="10" width="14" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="8" width="10" height="6" fill="#f59e0b" className="animate-pulse" />
      <rect x="68" y="25" width="8" height="8" fill="#10b981" className="animate-pulse" />
      <rect x="70" y="27" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="15" y="20" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="85" y="30" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="10" y="40" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="90" y="50" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
    </svg>
  ),
  pixel_pirate: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="25" y="15" width="50" height="12" fill="#1f2937" className="animate-pulse" />
      <rect x="20" y="20" width="60" height="8" fill="#374151" className="animate-pulse" />
      <rect x="30" y="22" width="40" height="4" fill="#dc2626" className="animate-pulse" />
      <rect x="35" y="25" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="30" width="8" height="6" fill="#1f2937" className="animate-pulse" />
      <rect x="42" y="28" width="4" height="10" fill="#1f2937" className="animate-pulse" />
      <rect x="52" y="32" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="45" width="36" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="53" width="40" height="30" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="58" width="30" height="20" fill="#92400e" className="animate-pulse" />
      <rect x="45" y="65" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="45" y="70" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="45" y="75" width="3" height="3" fill="#fbbf24" className="animate-pulse" />
      <rect x="15" y="50" width="8" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="52" width="8" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="40" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="25" width="14" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="23" width="10" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="5" y="70" width="8" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="6" y="72" width="6" height="4" fill="#f59e0b" className="animate-pulse" />
    </svg>
  ),
  pixel_elf: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="35" y="10" width="30" height="15" fill="#059669" className="animate-pulse" />
      <rect x="30" y="20" width="40" height="8" fill="#047857" className="animate-pulse" />
      <rect x="48" y="5" width="4" height="8" fill="#dc2626" className="animate-pulse" />
      <rect x="46" y="3" width="8" height="4" fill="#ef4444" className="animate-pulse" />
      <rect x="35" y="28" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="30" y="32" width="6" height="8" fill="#f59e0b" className="animate-pulse" />
      <rect x="64" y="32" width="6" height="8" fill="#f59e0b" className="animate-pulse" />
      <rect x="40" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="33" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="40" width="4" height="3" fill="#f59e0b" className="animate-pulse" />
      <rect x="42" y="45" width="16" height="2" fill="#1f2937" className="animate-pulse" />
      <rect x="30" y="48" width="40" height="35" fill="#059669" className="animate-pulse" />
      <rect x="35" y="53" width="30" height="25" fill="#047857" className="animate-pulse" />
      <rect x="32" y="60" width="36" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="75" y="25" width="4" height="35" fill="#7c2d12" className="animate-pulse" />
      <rect x="70" y="20" width="14" height="6" fill="#92400e" className="animate-pulse" />
      <rect x="72" y="18" width="10" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="76" y="15" width="2" height="25" fill="#6b7280" className="animate-pulse" />
      <rect x="75" y="10" width="4" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="10" y="30" width="4" height="4" fill="#10b981" className="animate-pulse" />
      <rect x="85" y="40" width="4" height="4" fill="#10b981" className="animate-pulse" />
      <rect x="5" y="50" width="4" height="4" fill="#10b981" className="animate-pulse" />
    </svg>
  ),
  pixel_dwarf: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="20" width="40" height="15" fill="#6b7280" className="animate-pulse" />
      <rect x="35" y="15" width="30" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="25" y="18" width="6" height="8" fill="#7c2d12" className="animate-pulse" />
      <rect x="69" y="18" width="6" height="8" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="35" width="30" height="20" fill="#fbbf24" className="animate-pulse" />
      <rect x="40" y="40" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="56" y="40" width="4" height="4" fill="#1f2937" className="animate-pulse" />
      <rect x="48" y="47" width="4" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="32" y="50" width="36" height="12" fill="#6b7280" className="animate-pulse" />
      <rect x="30" y="52" width="40" height="8" fill="#4b5563" className="animate-pulse" />
      <rect x="25" y="62" width="50" height="25" fill="#7c2d12" className="animate-pulse" />
      <rect x="30" y="67" width="40" height="15" fill="#92400e" className="animate-pulse" />
      <rect x="75" y="30" width="4" height="40" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="25" width="14" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="68" y="27" width="18" height="6" fill="#f59e0b" className="animate-pulse" />
      <rect x="15" y="50" width="12" height="20" fill="#dc2626" className="animate-pulse" />
      <rect x="17" y="52" width="8" height="16" fill="#ef4444" className="animate-pulse" />
      <rect x="19" y="55" width="4" height="10" fill="#fbbf24" className="animate-pulse" />
      <rect x="30" y="75" width="40" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="87" width="12" height="10" fill="#7c2d12" className="animate-pulse" />
      <rect x="53" y="87" width="12" height="10" fill="#7c2d12" className="animate-pulse" />
    </svg>
  ),
  pixel_samurai: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="15" width="40" height="20" fill="#1f2937" className="animate-pulse" />
      <rect x="35" y="10" width="30" height="8" fill="#374151" className="animate-pulse" />
      <rect x="45" y="5" width="10" height="8" fill="#dc2626" className="animate-pulse" />
      <rect x="47" y="3" width="6" height="12" fill="#ef4444" className="animate-pulse" />
      <rect x="40" y="25" width="20" height="8" fill="#6b7280" className="animate-pulse" />
      <rect x="42" y="27" width="16" height="4" fill="#4b5563" className="animate-pulse" />
      <rect x="45" y="28" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="52" y="28" width="3" height="3" fill="#1f2937" className="animate-pulse" />
      <rect x="25" y="35" width="50" height="35" fill="#1f2937" className="animate-pulse" />
      <rect x="30" y="40" width="40" height="6" fill="#374151" className="animate-pulse" />
      <rect x="30" y="50" width="40" height="6" fill="#374151" className="animate-pulse" />
      <rect x="30" y="60" width="40" height="6" fill="#374151" className="animate-pulse" />
      <rect x="75" y="20" width="3" height="50" fill="#6b7280" className="animate-pulse" />
      <rect x="70" y="15" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="72" y="13" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="15" y="40" width="3" height="30" fill="#6b7280" className="animate-pulse" />
      <rect x="10" y="35" width="13" height="8" fill="#fbbf24" className="animate-pulse" />
      <rect x="12" y="33" width="9" height="4" fill="#f59e0b" className="animate-pulse" />
      <rect x="30" y="65" width="40" height="4" fill="#7c2d12" className="animate-pulse" />
      <rect x="35" y="70" width="12" height="15" fill="#1f2937" className="animate-pulse" />
      <rect x="53" y="70" width="12" height="15" fill="#1f2937" className="animate-pulse" />
      <rect x="32" y="82" width="18" height="6" fill="#7c2d12" className="animate-pulse" />
      <rect x="50" y="82" width="18" height="6" fill="#7c2d12" className="animate-pulse" />
    </svg>
  )
};

const getCharacterGradient = (characterId: string): string => {
  const gradients: Record<string, string> = {
    pixel_wizard: 'from-purple-500 to-indigo-600',
    pixel_knight: 'from-gray-600 to-gray-800',
    pixel_ninja: 'from-gray-800 to-black',
    pixel_robot: 'from-gray-500 to-gray-700',
    pixel_archer: 'from-green-600 to-emerald-700',
    pixel_mage: 'from-blue-500 to-purple-600',
    pixel_pirate: 'from-red-600 to-orange-700',
    pixel_elf: 'from-green-500 to-emerald-600',
    pixel_dwarf: 'from-orange-600 to-red-700',
    pixel_samurai: 'from-gray-800 to-black'
  };
  return gradients[characterId] || 'from-emerald-500 via-green-500 to-teal-500';
};

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
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

  const [animatedProgress, setAnimatedProgress] = useState({
    calories: 0,
    weight: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (fetching) return;
    
    try {
      setLoading(true);
      setFetching(true);
      
      const [profileData, mealsData, goalsData] = await Promise.all([
        getProfile(user!.id),
        getMeals(user!.id),
        getUserGoals(user!.id)
      ]);

      setProfile(profileData);
      setMeals(mealsData);
      setGoals(goalsData);

      const dayStreak = calculateDayStreak(mealsData);
      const carbonSaved = calculateTotalCarbonSaved(mealsData);
      const weeklyAvgCalories = calculateWeeklyAverageCalories(mealsData);
      const avgProtein = calculateAverageProtein(mealsData);

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
      setLoading(false);
      setFetching(false);
    }
  };

  // Animation effect for progress bars
  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      const caloriesProgress = Math.min((stats.weeklyAvgCalories / (profile?.goal_calories || 2000)) * 100, 100);
      const activeGoal = goals.find(goal => goal.is_active);
      const weightProgress = activeGoal ? Math.max(10, Math.min(
        ((activeGoal.current_weight - activeGoal.target_weight) / 
        (activeGoal.current_weight - activeGoal.target_weight + 10)) * 100, 
        90
      )) : 0;
      
      setAnimatedProgress({
        calories: caloriesProgress,
        weight: weightProgress
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loading, stats.weeklyAvgCalories, profile?.goal_calories, goals]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getMealIcon = (type: string) => {
    const icons: Record<string, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const activeGoal = goals.find(goal => goal.is_active);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Minimal Header */}
        <div className="mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-2">
            Profile
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Your nutrition journey
          </p>
        </div>

        {/* Profile Card */}
        <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className={`w-24 h-24 bg-gradient-to-br ${getCharacterGradient(profile?.avatar_url || '')} rounded-2xl flex items-center justify-center overflow-hidden ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-slate-950`}>
              {profile?.avatar_url && CHARACTER_COMPONENTS[profile.avatar_url] ? (
                CHARACTER_COMPONENTS[profile.avatar_url]
              ) : (
                <div className="text-white text-3xl font-bold">
                  {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">
                {profile?.full_name || user?.email || 'User'}
              </h2>
              <p className="text-sm text-slate-400">{user?.email}</p>
              
              {/* Quick Stats */}
              <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <span className="text-emerald-400">🔥</span>
                  <span className="text-sm font-semibold text-white">{stats.dayStreak}</span>
                  <span className="text-xs text-slate-400">day streak</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <span className="text-blue-400">📊</span>
                  <span className="text-sm font-semibold text-white">{stats.mealsLogged}</span>
                  <span className="text-xs text-slate-400">meals</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <StatCard
            icon="🏆"
            label="Day Streak"
            value={stats.dayStreak}
            subtitle="consecutive days"
            color="orange"
          />
          <StatCard
            icon="🌱"
            label="CO₂ Saved"
            value={`${stats.carbonSaved.toFixed(1)}kg`}
            subtitle="total impact"
            color="emerald"
          />
          <StatCard
            icon="💪"
            label="Avg Protein"
            value={`${stats.avgProtein}g`}
            subtitle="per day"
            color="purple"
          />
        </div>

        {/* Goals Section */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Active Goals</h2>
          <div className="space-y-3">
            {/* Calorie Goal */}
            <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                      <TrendingUp className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Daily Calories</h3>
                      <p className="text-xs text-slate-400">Target goal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white transition-all duration-3000 ease-out">{profile?.goal_calories || 2000}</div>
                    <div className="text-xs text-slate-400">cal/day</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Weekly Average</span>
                    <span className="font-semibold text-blue-400">{stats.weeklyAvgCalories} cal</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all duration-3000 ease-out" 
                      style={{ width: `${animatedProgress.calories}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Goal */}
            {activeGoal && (
              <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                        <Award className="text-emerald-400" size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white capitalize">
                          {activeGoal.goal_type.replace('_', ' ')}
                        </h3>
                        <p className="text-xs text-slate-400">Active goal</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white transition-all duration-3000 ease-out">{activeGoal.target_weight}kg</div>
                      <div className="text-xs text-slate-400">target</div>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Current: {activeGoal.current_weight}kg</span>
                      <span className="font-semibold text-emerald-400">
                        {(activeGoal.current_weight - activeGoal.target_weight).toFixed(1)}kg to go
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1.5 rounded-full transition-all duration-3000 ease-out" 
                        style={{ 
                          width: `${animatedProgress.weight}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent Activity</h2>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
            <div className="divide-y divide-slate-800/50">
              {meals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="p-4 hover:bg-slate-800/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50 text-2xl flex-shrink-0">
                      {getMealIcon(meal.meal_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {meal.food_items.slice(0, 2).join(', ')}
                        {meal.food_items.length > 2 && '...'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">{formatDate(meal.date)}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-400 capitalize">{meal.meal_type}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-white">{meal.calories}</div>
                      <div className="text-xs text-slate-400">cal</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {meals.length === 0 && (
                <div className="p-12 text-center">
                  <Calendar className="mx-auto text-slate-600 mb-3" size={40} />
                  <p className="text-sm text-slate-400 font-medium">No meals logged yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start tracking your nutrition</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Settings</h2>
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
            <div className="divide-y divide-slate-800/50">
              <SettingItem 
                icon={<User size={18} />}
                title="Edit Profile"
                subtitle="Update personal information"
                onClick={() => navigate('/edit-profile')}
              />
              <SettingItem 
                icon={<Settings size={18} />}
                title="Dietary Preferences"
                subtitle="Manage goals and nutrition"
                onClick={() => navigate('/dietary-preferences')}
              />
              <SettingItem 
                icon={<Bell size={18} />}
                title="Notifications"
                subtitle="Customize reminders"
                onClick={() => navigate('/notifications')}
              />
              <SettingItem 
                icon={<Shield size={18} />}
                title="Privacy & Security"
                subtitle="Manage your data"
                onClick={() => navigate('/privacy')}
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <div>
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
            >
              <LogOut size={18} className="text-red-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-red-400">Log Out</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
}> = ({ icon, label, value, subtitle, color }) => {
  const colorMap: Record<string, string> = {
    orange: 'from-orange-950/20',
    emerald: 'from-emerald-950/20',
    purple: 'from-purple-950/20',
    blue: 'from-blue-950/20'
  };

  return (
    <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} to-transparent pointer-events-none`}></div>
      
      <div className="relative z-10">
        <div className="text-3xl mb-3">{icon}</div>
        <div className="text-2xl font-bold text-white mb-1 transition-all duration-3000 ease-out">{value}</div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</div>
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      </div>
    </div>
  );
};

// Setting Item Component
const SettingItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/20 transition-colors"
  >
    <div className="text-slate-400">
      {icon}
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <ChevronRight size={16} className="text-slate-600" />
  </button>
);