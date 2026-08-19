// Empty in development: Vite proxies /api. Set this to the public API origin in Vercel.
const origin = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const api = async (path) => { const r=await fetch(`${origin}/api${path}`); const body=await r.json(); if(!r.ok) throw new Error(body.error||'Request failed'); return body; };
export default api;
