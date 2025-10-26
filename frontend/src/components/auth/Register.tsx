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

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Registration successful! Setting up your profile...');
      setTimeout(() => navigate('/onboarding'), 1500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md relative z-10">
        {/* Background decoration icons */}
        <div className="absolute inset-0 opacity-10 -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl">🥗</div>
          <div className="absolute top-40 right-16 text-5xl">🌿</div>
          <div className="absolute bottom-40 left-20 text-7xl">🥑</div>
          <div className="absolute bottom-20 right-10 text-6xl">🍎</div>
          <div className="absolute top-1/2 left-1/4 text-5xl">🥦</div>
          <div className="absolute top-1/3 right-1/3 text-4xl">🌱</div>
          <div className="absolute top-2/3 left-1/2 text-5xl">🥝</div>
          <div className="absolute bottom-1/4 right-1/4 text-6xl">🍃</div>
        </div>

        {/* Signup Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
            <span className="text-5xl">🍽️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-slate-400">Create your MindMeal account</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8">
          {message ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
              <p className="text-slate-300 mb-4">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-300 mb-2.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-500 hover:border-slate-600"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder-slate-500 hover:border-slate-600"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500 mt-2">Use at least 6 characters for your password</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Account
              </button>
            </form>
          )}

          {error && !message && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {!message && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <a href="/login" className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};