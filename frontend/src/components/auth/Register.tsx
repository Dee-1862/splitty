import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      if (data.user) {
        setMessage('Registration successful! Redirecting to Dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setMessage('Success! Check your email to confirm your account before logging in.');
        setTimeout(() => navigate('/'), 3000);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">Sign Up</h2>
      {message && (
        <p className="text-green-600 mb-4 font-semibold text-center">{message}</p>
      )}
      {!message && (
        <form onSubmit={handleRegister}>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password (min 6 chars):
            </label>
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
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Register
          </button>
        </form>
      )}
      {error && <p className="text-red-500 mt-4 text-sm text-center">{error}</p>}
      <p className="text-center mt-6 text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Log in
        </a>
      </p>
    </div>
  );
};
