import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, LogOut } from 'lucide-react';
import { supabase } from '../../supabase';

export const TabNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'cookbook', label: 'Cookbook', icon: BookOpen, path: '/cookbook' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {tabs.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(path)
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full text-red-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={24} />
          <span className="text-xs mt-1 font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};
