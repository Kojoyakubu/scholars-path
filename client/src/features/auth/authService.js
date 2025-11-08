// /client/src/features/auth/authService.js - DIAGNOSTIC VERSION
// This version includes detailed logging to help debug

import api from '../../api/axios';

// -----------------------------------------------------------------------------
// 🔐 REGISTER USER - DIAGNOSTIC VERSION
// -----------------------------------------------------------------------------
const register = async (userData) => {
  console.log('=== REGISTRATION DEBUG START ===');
  console.log('1. Raw userData received:', userData);
  console.log('2. userData.fullName:', userData.fullName);
  console.log('3. userData.name:', userData.name);
  console.log('4. userData.email:', userData.email);
  console.log('5. userData.password:', userData.password ? '***' : 'MISSING');
  console.log('6. userData.role:', userData.role);
  
  // Transform fullName to name for backend
  const backendData = {
    name: userData.fullName || userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || 'student',
  };
  
  console.log('7. Transformed backendData:', backendData);
  console.log('8. backendData.name:', backendData.name);
  console.log('9. All fields present?', {
    hasName: !!backendData.name,
    hasEmail: !!backendData.email,
    hasPassword: !!backendData.password,
    hasRole: !!backendData.role,
  });
  
  try {
    console.log('10. Sending POST to /api/users/register...');
    const response = await api.post('/api/users/register', backendData);
    console.log('11. ✅ Success! Response:', response.data);
    console.log('=== REGISTRATION DEBUG END ===');
    return response.data;
  } catch (error) {
    console.error('12. ❌ Registration failed');
    console.error('13. Error response:', error.response?.data);
    console.error('14. Error status:', error.response?.status);
    console.error('15. Full error:', error);
    console.log('=== REGISTRATION DEBUG END ===');
    throw error;
  }
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