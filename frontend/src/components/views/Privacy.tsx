import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Download, Trash2 } from 'lucide-react';

export const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Privacy & Security</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Privacy Overview */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-primary-600" size={24} />
            <h2 className="text-lg font-semibold text-white">Your Privacy</h2>
          </div>
          <p className="text-gray-300 mb-4">
            We take your privacy seriously. Your data is encrypted and stored securely. 
            We never share your personal information with third parties without your consent.
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Lock size={16} />
              <span>All data is encrypted in transit and at rest</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>You control who can see your information</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span>Regular security audits and updates</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Download className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium text-white">Download Your Data</p>
                  <p className="text-sm text-gray-400">Export all your data in a portable format</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Eye className="text-primary-600" size={20} />
                <div>
                  <p className="font-medium text-white">View Data Usage</p>
                  <p className="text-sm text-gray-400">See how your data is being used</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-4 bg-red-900/20 rounded-lg hover:bg-red-900/30 transition-colors">
              <div className="flex items-center gap-3">
                <Trash2 className="text-red-400" size={20} />
                <div>
                  <p className="font-medium text-red-300">Delete Account</p>
                  <p className="text-sm text-red-400">Permanently delete your account and all data</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-white">Analytics</p>
                <p className="text-sm text-gray-400">Help improve the app with anonymous usage data</p>
              </div>
              <div className="w-12 h-6 bg-primary-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-white">Marketing Emails</p>
                <p className="text-sm text-gray-400">Receive tips and updates via email</p>
              </div>
              <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-white">Data Sharing</p>
                <p className="text-sm text-gray-400">Share anonymized data for research</p>
              </div>
              <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Questions or Concerns?</h3>
          <p className="text-gray-300 mb-4">
            If you have any questions about your privacy or data, please contact us.
          </p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
