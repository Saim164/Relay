const API_URL = "/api/v1";

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