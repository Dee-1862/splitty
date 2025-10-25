import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Target, TrendingUp, Calendar, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../supabase';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-6 mb-4 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <User className="text-primary-600" size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">John Doe</h1>
            <p className="text-primary-100">john.doe@example.com</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">7</p>
            <p className="text-xs text-primary-100">Day Streak</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">42</p>
            <p className="text-xs text-primary-100">Meals Logged</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">5.2</p>
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
            <p className="text-sm text-gray-600">2,000 cal/day</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
            <p className="font-semibold text-gray-900 mb-1">Fitness Goal</p>
            <p className="text-sm text-gray-600">Lose Weight</p>
          </div>
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
              <span className="text-sm font-semibold">1,850 cal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Protein Intake</span>
              <span className="text-sm font-semibold">140g avg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '93%' }}></div>
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
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Edit Profile</p>
            <p className="text-sm text-gray-500">Update personal information</p>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Dietary Preferences</p>
            <p className="text-sm text-gray-500">Manage restrictions and allergies</p>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Notification Settings</p>
            <p className="text-sm text-gray-500">Customize reminders</p>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Privacy & Security</p>
            <p className="text-sm text-gray-500">Manage your data and privacy</p>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut size={20} />
            <div>
              <p className="font-medium">Logout</p>
              <p className="text-sm text-red-400">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* Meal History */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-primary-600" size={24} />
          <h2 className="text-lg font-semibold">Meal History</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl">🍔</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Burger with Fries</p>
              <p className="text-sm text-gray-500">2 days ago</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">650 cal</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl">🍜</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Ramen Bowl</p>
              <p className="text-sm text-gray-500">3 days ago</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">520 cal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
