"use client";

import { createContext, useContext } from "react";

// Provided by app/dashboard/layout.jsx so the chat pages can read the
// logged-in user and update the shared chat list.
export const DashboardContext = createContext(null);

export function useDashboard() {
  return useContext(DashboardContext);
}
