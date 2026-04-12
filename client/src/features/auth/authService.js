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
    const payload = response.data || {};
    return {
      message: payload.message,
      needsApproval: !!payload.needsApproval,
      needsVerification: !!payload.needsVerification,
      user: payload.user || null,
      accessToken: payload.accessToken || null,
      refreshToken: payload.refreshToken || null,
    };
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
  const payload = response.data || {};
  const user = payload.user;
  const accessToken = payload.accessToken || user?.token;
  const refreshToken = payload.refreshToken;

  if (payload.requires2FA) {
    return {
      requires2FA: true,
      tempToken: payload.tempToken,
      message: payload.message || 'Two-factor authentication is required.',
      user: user || null,
    };
  }

  if (user && accessToken) {
    const normalizedUser = {
      ...user,
      token: accessToken,
      accessToken,
      refreshToken: refreshToken || user?.refreshToken,
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  }

  throw new Error(payload.message || 'Invalid login response from server');
};

// -----------------------------------------------------------------------------
// 🔓 GOOGLE AUTH (LOGIN / REGISTER)
// -----------------------------------------------------------------------------
const googleAuth = async ({ credential, mode = 'login', role = 'student' }) => {
  const response = await api.post('/api/users/google-auth', {
    credential,
    mode,
    role,
  });

  const payload = response.data || {};
  const user = payload.user;
  const accessToken = payload.accessToken || user?.token;
  const refreshToken = payload.refreshToken;

  if (payload.requires2FA) {
    return {
      requires2FA: true,
      tempToken: payload.tempToken,
      message: payload.message || 'Two-factor authentication is required.',
      user: user || null,
    };
  }

  if (user && accessToken) {
    const normalizedUser = {
      ...user,
      token: accessToken,
      accessToken,
      refreshToken: refreshToken || user?.refreshToken,
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  }

  return {
    message: payload.message || 'Google authentication completed.',
    needsApproval: !!payload.needsApproval,
    user: user || null,
  };
};

// -----------------------------------------------------------------------------
// 🔓 GENERIC SOCIAL AUTH (FACEBOOK / GITHUB / LINKEDIN / TIKTOK / X)
// -----------------------------------------------------------------------------
const socialAuth = async ({ provider, accessToken, mode = 'login', role = 'student', email }) => {
  const response = await api.post('/api/users/social-auth', {
    provider,
    accessToken,
    mode,
    role,
    email,
  });

  const payload = response.data || {};
  const user = payload.user;
  const token = payload.accessToken || user?.token;
  const refreshToken = payload.refreshToken;

  if (payload.requires2FA) {
    return {
      requires2FA: true,
      tempToken: payload.tempToken,
      message: payload.message || 'Two-factor authentication is required.',
      user: user || null,
    };
  }

  if (user && token) {
    const normalizedUser = {
      ...user,
      token,
      accessToken: token,
      refreshToken: refreshToken || user?.refreshToken,
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  }

  return {
    message: payload.message || `${provider} authentication completed.`,
    needsApproval: !!payload.needsApproval,
    user: user || null,
  };
};

// -----------------------------------------------------------------------------
// 👤 GET USER PROFILE
// -----------------------------------------------------------------------------
const getProfile = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = storedUser?.token || storedUser?.accessToken;

  if (!token) {
    throw new Error('No token found. Please log in again.');
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
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
  const token = storedUser?.token || storedUser?.accessToken;

  if (!token) {
    throw new Error('No token found. Please log in again.');
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
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
  googleAuth,
  socialAuth,
  getProfile,
  updateProfile,
  logout,
};

export default authService;