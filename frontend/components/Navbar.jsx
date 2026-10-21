"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "../lib/api.js";
import { primaryButtonClass } from "../lib/styles.js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isDashboard = pathname?.startsWith("/dashboard");

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await apiRequest("/users/logout", { method: "POST" });
      router.replace("/login");
    } catch (error) {
      setLogoutError(error.message);
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
            className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-60`}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        ) : (
          <Link href="/login" className={primaryButtonClass}>
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
