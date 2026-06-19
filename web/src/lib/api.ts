export const apiUrl = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${apiUrl}${path}`, options);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  if (res.status === 204) return null;
  return res.json();
}
