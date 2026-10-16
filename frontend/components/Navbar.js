"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { API_V1_URL } from "../lib/api.js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isDashboard = pathname?.startsWith("/dashboard");

  async function handleLogout() {
    if (!API_V1_URL) {
      setLogoutError("API URL is not configured.");
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch(`${API_V1_URL}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed. Please try again.");

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(error.message || "Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Relay home"
          className="group flex items-center gap-2 no-underline hover:no-underline"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-600 transition-transform group-hover:scale-110" />
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Relay
          </span>
        </Link>

        {isDashboard ? (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Log in
          </Link>
        )}
      </div>
      {logoutError && (
        <p role="alert" className="absolute right-4 top-full mt-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-red-700 shadow-sm sm:right-6">
          {logoutError}
        </p>
      )}
    </header>
  );
}
