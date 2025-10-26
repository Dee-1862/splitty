import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-gray-950">
      {!isAuthPage && (
        <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">MindMeal</h1>
            <nav className="flex gap-4">
              {isAuthenticated ? (
                <a
                  href="/dashboard"
                  className="text-primary-500 hover:text-primary-400 font-medium"
                >
                  Dashboard
                </a>
              ) : (
                <>
                  <a
                    href="/login"
                    className="text-primary-500 hover:text-primary-400 font-medium"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Sign Up
                  </a>
                </>
              )}
            </nav>
          </div>
        </header>
      )}
      <main className={isAuthPage ? '' : 'max-w-7xl mx-auto px-4 py-8'}>
        <Outlet />
      </main>
    </div>
  );
};