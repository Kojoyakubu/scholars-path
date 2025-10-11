import axios from 'axios';

// Determine the base URL based on the environment
// In development, this will be an empty string, so requests go to the proxy.
// In production (on Render), it will be your actual backend URL.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor to add the JWT token to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (userInfo && userInfo.token) {
      config.headers['Authorization'] = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;