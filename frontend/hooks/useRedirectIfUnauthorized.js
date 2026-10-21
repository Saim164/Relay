"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useRedirectIfUnauthorized() {
  const router = useRouter();

  return useCallback(
    (error) => {
      if (error.status !== 401) return false;
      router.replace("/login");
      return true;
    },
    [router]
  );
}
