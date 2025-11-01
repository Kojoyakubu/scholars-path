// /client/src/features/auth/authService.js
import api from '../../api/axios';

// ======================
// 🔐 REGISTER USER
// ======================
const register = async (userData) => {
  // ✅ Use the full, explicit path from the server root
  const response = await api.post('/api/users/register', userData);
  return response.data;
};

// ======================
// 🔑 LOGIN USER
// ======================
const login = async (userData) => {
  // ✅ Use the full, explicit path from the server root
  const response = await api.post('/api/users/login', userData);

  // This logic is correct for saving to localStorage
  if (response.data?.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};

// ======================
// 👤 GET USER PROFILE
// ======================
const getProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please login again.');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ✅ Use the full, explicit path from the server root
  const response = await api.get('/api/users/profile', config);
  return response.data;
};

// ======================
// 🚪 LOGOUT USER
// ======================
const logout = () => {
  // ✅ This function simply removes user data from local storage.
  // The corresponding Redux thunk in authSlice.js handles clearing the Redux state.
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};


const authService = {
  register,
  login,
  getProfile,
  logout, // ✅ Now included
};

export default authService;