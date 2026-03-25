// /client/api/axios.js
import axios from 'axios';

// -----------------------------------------------------------------------------
// 🌐 BASE URL
// -----------------------------------------------------------------------------
const baseURL =
  import.meta.env.VITE_API_URL || 'https://scholars-path-backend.onrender.com';

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

const shouldHandleUnauthorized = (error) => {
  const status = error.response?.status;
  const requestUrl = error.config?.url || '';

  if (status !== 401) {
    return false;
  }

  // Do not redirect for authentication endpoints where a 401 can be expected.
  if (requestUrl.includes('/api/users/login') || requestUrl.includes('/api/users/register')) {
    return false;
  }

  return true;
};

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldHandleUnauthorized(error)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('studentClassSelection');

      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: {
            message: 'Your session has expired. Please log in again.',
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// 🚀 EXPORT
// -----------------------------------------------------------------------------
export default API;
