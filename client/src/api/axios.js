// /client/api/axios.js
import axios from 'axios';

// ✅ Always include `/api` at the end of the backend base URL
const baseURL =
  import.meta.env.VITE_API_URL || 'https://scholars-path-backend.onrender.com/api';

console.log('Scholars Path using API baseURL:', baseURL);

const API = axios.create({
  baseURL,
  withCredentials: true,
});

// ✅ Attach auth token automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
