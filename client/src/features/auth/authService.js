// /client/src/features/auth/authService.js - FINAL FIX
// Backend expects 'fullName' not 'name'

import api from '../../api/axios';

// -----------------------------------------------------------------------------
// 🔐 REGISTER USER - SENDS fullName (not name)
// -----------------------------------------------------------------------------
const register = async (userData) => {
  // Backend expects 'fullName' field, not 'name'
  const backendData = {
    fullName: userData.fullName || userData.name,  // Keep as fullName
    email: userData.email,
    password: userData.password,
    role: userData.role || 'student',
  };
  
  console.log('📤 Sending registration data (with fullName):', backendData);
  
  const response = await api.post('/api/users/register', backendData);
  return response.data;
};

// -----------------------------------------------------------------------------
// 🔓 LOGIN USER
// -----------------------------------------------------------------------------
const login = async (userData) => {
  const response = await api.post('/api/users/login', userData);

  // ✅ Extract user from response (backend structure: { message, user })
  const user = response.data.user;

  // ✅ Validate user data before storing
  if (user && user.token) {
    // Store the complete user object in localStorage
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
  
  // ✅ Merge profile data with existing user data
  const updatedUser = { ...storedUser, ...response.data };
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
  logout,
};

export default authService;