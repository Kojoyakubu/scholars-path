// /client/src/api/axios.js
import axios from 'axios';

// This is the CORRECT way for a Vite project.
// In development, it defaults to '/api' to use the Vite proxy.
// In production, it uses the environment variable you set on Render.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

/**
 * Axios Request Interceptor
 * This automatically attaches the user's authentication token to the
 * 'Authorization' header of every outgoing request.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Safely retrieve user info from localStorage.
    const userString = localStorage.getItem('user');
    
    if (userString) {
      // 2. Parse the stored string into an object.
      const user = JSON.parse(userString);
      
      // 3. Check for the existence of the user and their token before setting the header.
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    
    // 4. Return the modified config to proceed with the request.
    return config;
  },
  (error) => {
    // Pass along any errors from the request setup.
    return Promise.reject(error);
  }
);

export default axiosInstance;