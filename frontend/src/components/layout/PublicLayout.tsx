import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../AuthContext';


export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth(); 

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
      <header style={{ padding: '15px', background: '#ffffff', borderBottom: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', color: '#333' }}>Simple React App</h1>
          <nav>
            <a href="/home" style={{ marginRight: '15px', color: '#007bff' }}>Home</a>
            <a href="/about" style={{ marginRight: '15px', color: '#007bff' }}>About</a>
            {isAuthenticated ? (
              <a href="/dashboard" style={{ marginRight: '15px', color: '#007bff' }}>Dashboard</a>
            ) : (
              <>
                <a href="/" style={{ marginRight: '15px', color: '#007bff' }}>Login</a>
                <a href="/register" style={{ marginRight: '15px', color: '#007bff' }}>Sign Up</a>
              </>
            )}
          </nav>
        </div>
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet /> 
      </main>
    </div>
  );
};