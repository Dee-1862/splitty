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

import { PublicLayout } from "./components/layout/PublicLayout";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Onboarding } from "./components/auth/Onboarding";
import { Dashboard } from "./components/views/Dashboard";
import { Cookbook } from "./components/views/Cookbook";
import { Profile } from "./components/views/Profile";
import { EditProfile } from "./components/views/EditProfile";
import { DietaryPreferences } from "./components/views/DietaryPreferences";
import { Notifications } from "./components/views/Notifications";
import { Privacy } from "./components/views/Privacy";
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
          'Login'
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
    loader: async () => {
      const session = await getSession();
      if (session) {
        throw redirect("/dashboard");
      } else {
        throw redirect("/login");
      }
    }
  },

  {
    element: React.createElement(PublicLayout),
    children: [
      { path: "/landing", element: React.createElement(LandingPage) },
      { path: "/login", element: React.createElement(Login), loader: requireAnon },
      { path: "/register", element: React.createElement(Register), loader: requireAnon },
    ],
  },

  {
    element: React.createElement(PublicLayout),
    children: [
      { path: "/onboarding", element: React.createElement(Onboarding), loader: requireAuth },
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
      {
        path: "/edit-profile",
        element: React.createElement(ProtectedLayout, null, React.createElement(EditProfile)),
      },
      {
        path: "/dietary-preferences",
        element: React.createElement(ProtectedLayout, null, React.createElement(DietaryPreferences)),
      },
      {
        path: "/notifications",
        element: React.createElement(ProtectedLayout, null, React.createElement(Notifications)),
      },
      {
        path: "/privacy",
        element: React.createElement(ProtectedLayout, null, React.createElement(Privacy)),
      },
    ],
  },
  {
    path: "*",
    element: React.createElement("div", { className: 'p-8 text-center' }, "Page not found"),
  },
]);
