import axios from 'axios';

// Try to read from Vite environment (during build)
let baseURL = import.meta?.env?.VITE_API_URL;

// ✅ If that fails (e.g., Render didn’t embed it), choose dynamically:
if (!baseURL) {
  if (window.location.hostname.includes('onrender.com')) {
    baseURL = 'https://scholars-path-backend.onrender.com/api';
  } else {
    baseURL = 'http://localhost:5000/api';
  }
}

// 🔍 Debug log to confirm what URL it’s using
console.log("✅ Scholars Path using API baseURL:", baseURL);

const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default API;
