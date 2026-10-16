"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../components/DashboardShell.jsx";
import { apiRequest } from "../../lib/api.js";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isActive = true;

    apiRequest("/users/me", { cache: "no-store" })
      .then(({ user: currentUser }) => {
        if (!isActive) return;
        setUser(currentUser);
        setStatus("ready");
      })
      .catch((error) => {
        if (!isActive) return;
        if (error.status === 401) {
          router.replace("/login");
          return;
        }
        setStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, [router]);

  if (status === "loading") {
    return <StatusMessage>Checking your session...</StatusMessage>;
  }
  if (status === "error") {
    return <StatusMessage>Could not verify your session. Please try again.</StatusMessage>;
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

function StatusMessage({ children }) {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-neutral-50 px-5 text-center text-sm text-neutral-600">
      {children}
    </div>
  );
}
