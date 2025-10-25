import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes'; 
import { AuthProvider } from './AuthContext';
import './index.css';

const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(RouterProvider, { router })
    )
  )
);
