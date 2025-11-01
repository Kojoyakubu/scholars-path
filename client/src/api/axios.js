// /client/api/axios.js
import axios from 'axios';

// ✅ Always points to Render backend (or local if available)
const baseURL =
  import.meta.env.VITE_API_URL ||
  'https://scholars-path-backend.onrender.com/api';

console.log('Scholars Path using API baseURL:', baseURL);

// Create axios instance
const API = axios.create({
  baseURL,
  withCredentials: true, // allow cookies and auth headers
});

// ✅ Auto attach JWT token
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
