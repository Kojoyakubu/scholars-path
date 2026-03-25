// /client/src/features/auth/authService.js - ENSURES EXACT FORMAT
import api from '../../api/axios';

// -----------------------------------------------------------------------------
// 🔐 REGISTER USER - Ensures exact data format
// -----------------------------------------------------------------------------
const register = async (userData) => {
  // Ensure all fields are strings and properly formatted
  const backendData = {
    fullName: String(userData.fullName || userData.name || '').trim(),
    email: String(userData.email || '').trim().toLowerCase(),
    password: String(userData.password || ''),
    role: String(userData.role || 'student'),
  };
  
  // Validate before sending
  if (!backendData.fullName) {
    throw new Error('Full name is required');
  }
  if (!backendData.email) {
    throw new Error('Email is required');
  }
  if (!backendData.password) {
    throw new Error('Password is required');
  }
  
  try {
    const response = await api.post('/api/users/register', backendData);
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed');
    console.error('Request data:', backendData);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// -----------------------------------------------------------------------------
// 🔓 LOGIN USER
// -----------------------------------------------------------------------------
const login = async (userData) => {
  const response = await api.post('/api/users/login', userData);
  const user = response.data.user;

  if (user && user.token) {
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  throw new Error('Invalid login response from server');
};

// -----------------------------------------------------------------------------
// 👤 GET USER PROFILE
// -----------------------------------------------------------------------------
const getProfile = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (!storedUser?.token) {
    throw new Error('No token found. Please log in again.');
  }

  const config = {
    headers: {
      Authorization: `Bearer ${storedUser.token}`,
    },
  };

  const response = await api.get('/api/users/profile', config);
  const updatedUser = { ...storedUser, ...response.data };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  
  return updatedUser;
};

// -----------------------------------------------------------------------------
// ✏️ UPDATE USER PROFILE
// -----------------------------------------------------------------------------
const updateProfile = async (profileData) => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (!storedUser?.token) {
    throw new Error('No token found. Please log in again.');
  }

  const config = {
    headers: {
      Authorization: `Bearer ${storedUser.token}`,
    },
  };

  const response = await api.put('/api/users/profile', profileData, config);
  const updatedUser = response.data?.user ? { ...storedUser, ...response.data.user } : storedUser;
  localStorage.setItem('user', JSON.stringify(updatedUser));

  return updatedUser;
};

// -----------------------------------------------------------------------------
// 🚪 LOGOUT USER
// -----------------------------------------------------------------------------
const logout = () => {
  localStorage.removeItem('user');
};

// -----------------------------------------------------------------------------
// 📦 EXPORT SERVICE
// -----------------------------------------------------------------------------
const authService = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
};

export default authService;