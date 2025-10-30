import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL;

// ✅ If env not loaded in build, use a dynamic fallback
if (!baseURL) {
  const origin = window.location.origin;
  baseURL = origin.includes('render.com')
    ? 'https://scholars-path-backend.onrender.com/api'
    : 'http://localhost:5000/api';
}

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
