// /client/src/features/auth/authService.js
import api from '../../api/axios';

// -----------------------------------------------------------------------------
// 🔐 REGISTER USER
// -----------------------------------------------------------------------------
const register = async (userData) => {
  const response = await api.post('/api/users/register', userData);
  return response.data; // backend already returns { message, user }
};

// -----------------------------------------------------------------------------
// 🔑 LOGIN USER
// -----------------------------------------------------------------------------
const login = async (userData) => {
  const response = await API.post('/users/login', userData);

  if (response.data && response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user; // return only the user
  }

  return null;
};

// -----------------------------------------------------------------------------
// 👤 GET USER PROFILE
// -----------------------------------------------------------------------------
const getProfile = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (!storedUser?.token) throw new Error('No token found. Please log in again.');

  const config = {
    headers: {
      Authorization: `Bearer ${storedUser.token}`,
    },
  };

  const response = await api.get('/api/users/profile', config);
  return response.data;
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
