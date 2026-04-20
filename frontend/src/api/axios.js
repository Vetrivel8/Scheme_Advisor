import axios from "axios";

// Vite inlines import.meta.env at build time.
// In production this will be the value you set in Vercel Dashboard.
// In local dev this falls back to the value in .env
const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error(
    "[axios] VITE_API_URL is undefined. " +
    "Set it in Vercel Dashboard → Frontend project → Settings → Environment Variables."
  );
}

const api = axios.create({
  baseURL,
  withCredentials: true,   // required for JWT cookies / auth headers
  timeout: 15000,          // fail fast instead of hanging forever
});

export default api;
