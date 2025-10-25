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
    <div style={{ maxWidth: '300px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Log In</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
      {error && <p style={{ color: '#e53e3e', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        New user? <a href="/register" style={{ color: '#007bff' }}>Create an account</a>
      </p>
    </div>
  );
};