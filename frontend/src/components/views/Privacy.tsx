import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Download, Trash2 } from 'lucide-react';

export const Privacy: React.FC = () => {
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
                Privacy & Security
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">
                Your data protection and privacy controls
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Privacy Overview */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Shield className="text-blue-400" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Your Privacy</h2>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                We take your privacy seriously. Your data is encrypted and stored securely. 
                We never share your personal information with third parties without your consent.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Lock className="text-emerald-400" size={18} />
                  <span className="text-sm text-slate-300">All data is encrypted in transit and at rest</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Eye className="text-blue-400" size={18} />
                  <span className="text-sm text-slate-300">You control who can see your information</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Shield className="text-purple-400" size={18} />
                  <span className="text-sm text-slate-300">Regular security audits and updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-6">Data Management</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                      <Download className="text-emerald-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-white">Download Your Data</p>
                      <p className="text-sm text-slate-400">Export all your data in a portable format</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                      <Eye className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-white">View Data Usage</p>
                      <p className="text-sm text-slate-400">See how your data is being used</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                      <Trash2 className="text-red-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-red-300">Delete Account</p>
                      <p className="text-sm text-red-400">Permanently delete your account and all data</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-6">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                  <div>
                    <p className="font-medium text-white">Analytics</p>
                    <p className="text-sm text-slate-400">Help improve the app with anonymous usage data</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-800/50 rounded-full relative cursor-pointer border border-slate-700/50">
                    <div className="w-5 h-5 bg-slate-600 rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                  <div>
                    <p className="font-medium text-white">Marketing Emails</p>
                    <p className="text-sm text-slate-400">Receive tips and updates via email</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-800/50 rounded-full relative cursor-pointer border border-slate-700/50">
                    <div className="w-5 h-5 bg-slate-600 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                  <div>
                    <p className="font-medium text-white">Data Sharing</p>
                    <p className="text-sm text-slate-400">Share anonymized data for research</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-800/50 rounded-full relative cursor-pointer border border-slate-700/50">
                    <div className="w-5 h-5 bg-slate-600 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-4">Questions or Concerns?</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                If you have any questions about your privacy or data, please contact us.
              </p>
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all duration-200 font-medium shadow-lg shadow-emerald-500/20">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
