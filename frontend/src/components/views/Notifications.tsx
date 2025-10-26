import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Mail, Smartphone } from 'lucide-react';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();

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
                Notifications
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">
                Customize your reminders and alerts
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Coming Soon Card */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Bell className="text-blue-400" size={40} />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Coming Soon</h2>
              <p className="text-slate-300 mb-8 leading-relaxed max-w-md mx-auto">
                Notification settings are currently under development. You'll be able to customize your reminders and alerts here.
              </p>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Clock className="text-emerald-400" size={18} />
                  <span className="text-sm text-slate-300">Meal reminder notifications</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Mail className="text-blue-400" size={18} />
                  <span className="text-sm text-slate-300">Email updates and tips</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Smartphone className="text-purple-400" size={18} />
                  <span className="text-sm text-slate-300">Push notifications</span>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Settings */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                  <div>
                    <p className="font-medium text-white">Meal Reminders</p>
                    <p className="text-sm text-slate-400">Get reminded to log your meals</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-800/50 rounded-full relative cursor-pointer border border-slate-700/50">
                    <div className="w-5 h-5 bg-slate-600 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                  <div>
                    <p className="font-medium text-white">Goal Updates</p>
                    <p className="text-sm text-slate-400">Weekly progress reports</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-800/50 rounded-full relative cursor-pointer border border-slate-700/50">
                    <div className="w-5 h-5 bg-slate-600 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                  <div>
                    <p className="font-medium text-white">Tips & Insights</p>
                    <p className="text-sm text-slate-400">Nutrition tips and health insights</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-800/50 rounded-full relative cursor-pointer border border-slate-700/50">
                    <div className="w-5 h-5 bg-slate-600 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
