"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useRedirectIfUnauthorized } from "./useRedirectIfUnauthorized.js";

export function useSession() {
  const redirectIfUnauthorized = useRedirectIfUnauthorized();
  const [session, setSession] = useState({ status: "loading", user: null });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const { user } = await apiRequest("/users/me", { signal: controller.signal });
        setSession({ status: "ready", user });
      } catch (error) {
        if (controller.signal.aborted || redirectIfUnauthorized(error)) return;
        setSession({ status: "error", user: null });
      }
    }

    loadSession();
    return () => controller.abort();
  }, [redirectIfUnauthorized]);

  return session;
}
