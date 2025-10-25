import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo') || '/dashboard';
      navigate(redirectTo);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">Log In</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          Log In
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-sm text-center">{error}</p>}
      <p className="text-center mt-6 text-sm text-gray-600">
        New user?{' '}
        <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Create an account
        </a>
      </p>
    </div>
  );
};