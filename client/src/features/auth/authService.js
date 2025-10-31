// src/features/auth/authService.js
import api from '../../api/axios';

// ======================
// 🔐 REGISTER USER
// POST /api/users/register
// ======================
const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// ======================
// 🔑 LOGIN USER
// POST /api/users/login
// ======================
const login = async (userData) => {
  const response = await api.post('/users/login', userData);

  // Save user & token to localStorage if successful
  if (response.data?.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};

// ======================
// 👤 GET USER PROFILE (Protected)
// GET /api/users/profile
// ======================
const getProfile = async () => {
  const token = localStorage.getItem('token');

  if (!token) throw new Error('No token found. Please login again.');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await api.get('/users/profile', config);
  return response.data;
};

// ======================
// 🚪 LOGOUT USER
// ======================
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const authService = {
  register,
  login,
  getProfile,
  logout,
};

export default authService;
