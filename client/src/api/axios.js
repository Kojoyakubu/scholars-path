// /client/api/axios.js
import axios from 'axios';

// -----------------------------------------------------------------------------
// 🌐 BASE URL
// -----------------------------------------------------------------------------
const baseURL =
  import.meta.env.VITE_API_URL || 'https://scholars-path-backend.onrender.com';

console.log('✅ Scholars Path API baseURL:', baseURL);

// -----------------------------------------------------------------------------
// ⚙️ AXIOS INSTANCE
// -----------------------------------------------------------------------------
const API = axios.create({
  baseURL,
  withCredentials: false, // ✅ token-based auth, no cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------------------------
// 🔑 TOKEN INTERCEPTOR
// -----------------------------------------------------------------------------
API.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const token = user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn('⚠️ Token parse error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
// 🚀 EXPORT
// -----------------------------------------------------------------------------
export default API;
