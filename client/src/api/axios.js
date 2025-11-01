// /client/api/axios.js
import axios from 'axios';

// ✅ Set the base URL directly to the root of your backend server.
const baseURL = 'https://scholars-path-backend.onrender.com';

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