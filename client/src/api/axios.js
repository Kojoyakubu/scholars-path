import axios from 'axios';

// Attempt to use environment variable
let baseURL = import.meta.env.VITE_API_URL;

// ✅ Fallback if the env var isn't embedded at build time
if (!baseURL) {
  if (window.location.hostname.includes('onrender.com')) {
    baseURL = 'https://scholars-path-backend.onrender.com/api';
  } else {
    baseURL = 'http://localhost:5000/api';
  }
}

console.log('🔗 Using API base URL:', baseURL); // Debug line

const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default API;
