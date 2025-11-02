// /client/src/features/auth/authService.js
import api from '../../api/axios';

// ======================
// 🔐 REGISTER USER
// ======================
const register = async (userData) => {
  const response = await api.post('/api/users/register', userData);
  return response.data;
};

// ======================
// 🔑 LOGIN USER
// ======================
const login = async (userData) => {
  const response = await api.post('/api/users/login', userData);

  // Normalize the returned data
  const data = response.data;
  const user = data.user || data; // defensive fallback

  // ✅ Ensure token is saved for axios interceptor
  if (user?.token) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  return user; // Return clean user object to Redux
};

// ======================
// 👤 GET USER PROFILE
// ======================
const getProfile = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (!storedUser?.token) throw new Error('No token found. Please login again.');

  const config = {
    headers: {
      Authorization: `Bearer ${storedUser.token}`,
    },
  };

  const response = await api.get('/api/users/profile', config);
  return response.data;
};

// ======================
// 🚪 LOGOUT USER
// ======================
const logout = () => {
  localStorage.removeItem('user');
};

// ======================
// EXPORT
// ======================
const authService = {
  register,
  login,
  getProfile,
  logout,
};

export default authService;
