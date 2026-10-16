import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell.jsx";
import { API_V1_URL, apiRequest } from "../../lib/api.js";

export default async function DashboardLayout({ children }) {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login");

  if (!API_V1_URL) {
    return <StatusMessage>Dashboard could not connect to the API.</StatusMessage>;
  }

  let user;
  try {
    ({ user } = await apiRequest("/users/me", {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    }));
  } catch (error) {
    if (error.status === 401) redirect("/login");
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
