import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import type { LoaderFunctionArgs } from "react-router-dom";
import { supabase } from "./supabase";

async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) console.error("Supabase session error:", error.message);
  return data?.session ?? null;
}

export async function requireAuth(_args?: LoaderFunctionArgs) {
  const session = await getSession();
  if (!session) throw redirect("/login");
  return null;
}

export async function requireAnon(_args?: LoaderFunctionArgs) {
  const session = await getSession();
  if (session) throw redirect("/dashboard");
  return null;
}

async function rootRedirect() {
  const session = await getSession();
  return redirect(session ? "/dashboard" : "/login");
}

import { PublicLayout } from "./components/layout/PublicLayout";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Dashboard } from "./components/views/Dashboard";
import { Cookbook } from "./components/views/Cookbook";
import { Profile } from "./components/views/Profile";
import { TabNavigation } from "./components/layout/TabNavigation";

// Landing Page Component
const LandingPage = () => {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4' },
    React.createElement(
      'div',
      { className: 'max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center' },
      React.createElement('h1', { className: 'text-4xl font-bold text-gray-900 mb-2' }, 'MindMeal'),
      React.createElement('p', { className: 'text-gray-600 mb-6' }, 'Track nutrition, reduce carbon footprint, and discover healthy recipes'),
      React.createElement(
        'div',
        { className: 'flex flex-col gap-3' },
        React.createElement(
          'a',
          { href: '/login', className: 'bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium' },
          'Get Started'
        ),
        React.createElement(
          'a',
          { href: '/register', className: 'border-2 border-primary-600 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium' },
          'Create Account'
        )
      )
    )
  );
};

// Layout wrapper for protected routes with tab navigation
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(
    React.Fragment,
    null,
    children,
    React.createElement(TabNavigation)
  );
};

export const router = createBrowserRouter([
  { 
    path: "/", 
    element: React.createElement(PublicLayout, null, React.createElement(LandingPage))
  },

  {
    element: React.createElement(PublicLayout),
    children: [
      { path: "/login", element: React.createElement(Login), loader: requireAnon },
      { path: "/register", element: React.createElement(Register), loader: requireAnon },
    ],
  },

  {
    loader: requireAuth,
    children: [
      {
        path: "/dashboard",
        element: React.createElement(ProtectedLayout, null, React.createElement(Dashboard)),
      },
      {
        path: "/cookbook",
        element: React.createElement(ProtectedLayout, null, React.createElement(Cookbook)),
      },
      {
        path: "/profile",
        element: React.createElement(ProtectedLayout, null, React.createElement(Profile)),
      },
    ],
  },
  {
    path: "*",
    element: React.createElement("div", { className: 'p-8 text-center' }, "Page not found"),
  },
]);
