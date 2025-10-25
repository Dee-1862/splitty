import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, User } from 'lucide-react';

export const TabNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'cookbook', label: 'Cookbook', icon: BookOpen, path: '/cookbook' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {tabs.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(path)
                ? 'text-primary-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};