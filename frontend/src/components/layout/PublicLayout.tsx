import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">MindMeal</h1>
          <nav className="flex gap-4">
            {isAuthenticated ? (
              <a
                href="/dashboard"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};