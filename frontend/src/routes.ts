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

import {PublicLayout} from "./components/layout/PublicLayout";
import {Login} from "./components/auth/Login";
import {Register} from "./components/auth/Register";
import {Home} from "./components/views/Home";
import {About} from "./components/views/About";
import {Dashboard} from "./components/views/Dashboard";
export const router = createBrowserRouter([
  { path: "/", loader: rootRedirect },

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
      { path: "/dashboard", element: React.createElement(Dashboard) },
      { path: "/home", element: React.createElement(Home) },
      { path: "/about", element: React.createElement(About) },
    ],
  },
  {
    path: "*",
    element: React.createElement("div", null, "Not found"),
  },
]);
