// /client/api/axios.js
import axios from 'axios';

// ✅ Backend root
const baseURL = import.meta.env.VITE_API_URL || 'https://scholars-path-backend.onrender.com';

console.log('✅ Scholars Path using API baseURL:', baseURL);

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// ✅ Attach token automatically if present
API.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const token = user?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('⚠️ Token parse error:', err);
  }
  return config;
});

export default API;
