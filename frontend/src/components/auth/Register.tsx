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
    <div style={{ maxWidth: '350px', margin: '20px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign Up</h2>
      {message && <p style={{ color: '#48bb78', marginBottom: '15px', fontWeight: 'bold' }}>{message}</p>}
      {!message && (
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Password (min 6 chars):</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Register
          </button>
        </form>
      )}
      {error && <p style={{ color: '#e53e3e', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        Already have an account? <a href="/" style={{ color: '#007bff' }}>Log in</a>
      </p>
    </div>
  );
};
