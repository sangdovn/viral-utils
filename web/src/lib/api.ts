const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(apiUrl(path), options);
}

export async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const body: unknown = await response.json().catch(() => null);

  if (
    typeof body === "object" &&
    body !== null &&
    "detail" in body &&
    typeof body.detail === "string"
  ) {
    return body.detail;
  }
  return fallback;
}
