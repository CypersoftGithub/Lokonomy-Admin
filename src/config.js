// Base URL for API requests.
// In development, leaves blank to use Vite dev server proxy.
// In production on Vercel, defaults to VITE_API_BASE_URL or fallback production backend URL.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://api.lokonomy.in' : '');
