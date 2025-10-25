import React, { useState } from 'react';
import { Profile } from './Profile';
import { StaticDebug } from './StaticDebug';
import { ProfileErrorBoundary } from './ProfileErrorBoundary';
import { Settings, Bug } from 'lucide-react';

export const ProfileWithDebugToggle: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-colors ${
            showDebug 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          {showDebug ? <Settings size={16} /> : <Bug size={16} />}
          {showDebug ? 'Exit Debug' : 'Debug Mode'}
        </button>
      </div>

      {/* Content */}
      <ProfileErrorBoundary>
        {showDebug ? <StaticDebug /> : <Profile />}
      </ProfileErrorBoundary>
    </div>
  );
};
