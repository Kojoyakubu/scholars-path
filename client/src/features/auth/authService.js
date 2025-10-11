// src/features/auth/authService.js (Revised)

import api from '../../api/axios'; // <-- Import our new centralized instance

// Register user
const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  // On successful registration, the API returns a message object
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/users/login', userData);
  if (response.data) {
    // The service layer is responsible for side effects like localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user - simple side effect, no API call needed
const logout = () => {
  localStorage.removeItem('user');
};

// Get user profile (getMe)
// The token is now handled automatically by the axios interceptor
const getMe = async () => {
    const response = await api.get('/users/profile');
    return response.data;
}

const authService = {
  register,
  logout,
  login,
  getMe,
};

export default authService;