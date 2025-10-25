import React from 'react';
import { User, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../AuthContext';

export const ProfileFallback: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-6 mb-4 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <User className="text-primary-600" size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.email || 'User'}</h1>
            <p className="text-primary-100">Profile Loading...</p>
          </div>
        </div>
      </div>

      {/* Error Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-yellow-500" size={24} />
          <h2 className="text-lg font-semibold">Profile Temporarily Unavailable</h2>
        </div>
        <p className="text-gray-600 mb-4">
          We're having trouble loading your profile data. This might be due to:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Database connection issues</li>
          <li>Missing profile data</li>
          <li>Network connectivity problems</li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh Page
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Status:</strong> <span className="text-green-600">Logged In</span></p>
        </div>
      </div>
    </div>
  );
};
