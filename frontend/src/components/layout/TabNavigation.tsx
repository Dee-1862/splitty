import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ChefHat, User } from 'lucide-react';

export const TabNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', icon: Home, path: '/dashboard' },
    { id: 'cookbook', icon: ChefHat, path: '/cookbook' },
    { id: 'profile', icon: User, path: '/profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center justify-center bg-gray-900 border border-gray-800 rounded-full shadow-lg px-8 py-3 gap-5">
        {tabs.map(({ id, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`p-2 rounded-full transition-all ${
              isActive(path)
                ? 'text-primary-500 bg-primary-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon size={24} />
          </button>
        ))}
      </div>
    </nav>
  );
};