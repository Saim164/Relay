// The backend's address. Leave NEXT_PUBLIC_API_URL unset to go through
// the Next.js proxy (/api/v1 → BACKEND_URL), which keeps the login cookie
// first-party so Safari doesn't block it.
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || null;
const API_URL = API_ORIGIN ? `${API_ORIGIN}/api/v1` : "/api/v1";

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    credentials: "include",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.message || "Request failed. Please try again.");
    error.status = response.status;
    throw error;
  }

  return result;
}