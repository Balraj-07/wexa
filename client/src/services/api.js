// Empty in development: Vite proxies /api. Set this to the public API origin in Vercel.
const origin = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const api = async (path, options = {}) => {
  const response = await fetch(`${origin}/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error || 'Request failed');
  return body;
};
export default api;
