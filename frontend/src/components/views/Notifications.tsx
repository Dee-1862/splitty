import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Mail, Smartphone } from 'lucide-react';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Coming Soon Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="text-primary-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Notification settings are currently under development. You'll be able to customize your reminders and alerts here.
          </p>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock size={16} />
              <span>Meal reminder notifications</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail size={16} />
              <span>Email updates and tips</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Smartphone size={16} />
              <span>Push notifications</span>
            </div>
          </div>
        </div>

        {/* Placeholder Settings */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Meal Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to log your meals</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Goal Updates</p>
                <p className="text-sm text-gray-500">Weekly progress reports</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Tips & Insights</p>
                <p className="text-sm text-gray-500">Nutrition tips and health insights</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
