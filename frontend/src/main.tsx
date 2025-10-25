import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { router } from './routes'; 
import { AuthProvider } from './AuthContext';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        React.Fragment,
        null,
        React.createElement(RouterProvider, { router }),
        React.createElement(ToastContainer, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          newestOnTop: false,
          closeOnClick: true,
          rtl: false,
          pauseOnFocusLoss: true,
          draggable: true,
          pauseOnHover: true,
        })
      )
    )
  )
);
