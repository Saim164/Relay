export const API_V1_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const API_ROOT_URL = API_V1_URL?.replace(/\/v1$/, "");

export async function apiRequest(path, { base = API_V1_URL, ...options } = {}) {
  if (!base) throw new Error("API URL is not configured.");

  const response = await fetch(`${base}${path}`, {
    credentials: "include",
    ...options,
  });
  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;
  }

  if (!response.ok) {
    const error = new Error(result.message || "Request failed. Please try again.");
    error.status = response.status;
    throw error;
  }

  return result;
}
