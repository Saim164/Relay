// All backend routes live under /api/v1 (users and conversations).
// NEXT_PUBLIC_API_URL is just the backend origin, e.g. https://relay-api.onrender.com
const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/v1`
  : null;

// Every request goes through here so they all send the auth cookie
// and fail the same way: an Error with the backend's message and HTTP status.
export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  if (!API_URL) throw new Error("API URL is not configured.");

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
