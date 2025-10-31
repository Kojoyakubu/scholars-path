import api from '../../api/axios';

// Login user
const login = async (userData) => {
  // 🔥 FIXED PATH — no extra `/api`
  const response = await api.post('/users/login', userData);
  return response.data;
};

// Register user
const register = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Get current user profile (if token exists)
const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
};

export default authService;
