import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; 
import { supabase } from '../../supabase'; 

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      navigate('/'); 
    }
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: '10px', background: '#e53e3e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
      Logout
    </button>
  );
};


export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: "30px", background: '#e0f7fa', borderRadius: '8px', maxWidth: '800px', margin: '20px auto' }}>
      <h1 style={{ color: '#00bcd4' }}>Protected Dashboard</h1>
      <p style={{ fontSize: '18px', marginTop: '10px' }}>Welcome back, **{user?.email || 'Authenticated User'}**!</p>
      <p style={{ marginTop: '20px', color: '#555' }}>
        This page content is only visible if the user is successfully authenticated by the 
        `loginLoader` configured in the routes.
      </p>
      <nav style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
        <LogoutButton /> 
      </nav>
    </div>
  );
};
