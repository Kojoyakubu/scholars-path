import axios from 'axios';

// --- Determine Base URL ---
let baseURL;

// ✅ 1. Try from environment variable first
if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
  baseURL = import.meta.env.VITE_API_URL;
}

// ✅ 2. Fallback: Auto-detect environment
if (!baseURL) {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  if (hostname.includes('onrender.com')) {
    // Production (Render frontend)
    baseURL = 'https://scholars-path-backend.onrender.com/api';
  } else {
    // Local dev
    baseURL = 'http://localhost:5000/api';
  }
}

// --- Debug Log ---
console.log('🌍 Scholars Path using API baseURL:', baseURL);

// --- Axios Instance ---
const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default API;
