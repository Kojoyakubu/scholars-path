// src/features/auth/authService.js
import api from '../../api/axios'; // Correct relative import

// Register user
const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/users/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get user profile
const getMe = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

const authService = { register, login, logout, getMe };
export default authService;
