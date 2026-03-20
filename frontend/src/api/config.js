// Vercel + local friendly backend base URL.
// `VITE_` vars are inlined at build time by Vite.
const BASE_URL = import.meta.env.VITE_API_URL || "https://shieldgig-backend.onrender.com";

export { BASE_URL };

