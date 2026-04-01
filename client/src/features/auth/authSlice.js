// /client/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

// -----------------------------------------------------------------------------
// 🧩 INITIAL STATE - Get user from localStorage on app load
// -----------------------------------------------------------------------------
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// -----------------------------------------------------------------------------
// 📝 REGISTER
// -----------------------------------------------------------------------------
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// -----------------------------------------------------------------------------
// 🔐 LOGIN
// -----------------------------------------------------------------------------
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const user = await authService.login(userData);
      return user;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// -----------------------------------------------------------------------------
// 🔐 GOOGLE AUTH
// -----------------------------------------------------------------------------
export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (googleData, thunkAPI) => {
    try {
      const response = await authService.googleAuth(googleData);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// -----------------------------------------------------------------------------
// 👤 GET PROFILE
// -----------------------------------------------------------------------------
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// -----------------------------------------------------------------------------
// ✏️ UPDATE PROFILE
// -----------------------------------------------------------------------------
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// -----------------------------------------------------------------------------
// 🚪 LOGOUT
// -----------------------------------------------------------------------------
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

// -----------------------------------------------------------------------------
// ⚙️ SLICE
// -----------------------------------------------------------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // 🆕 Add action to sync user from localStorage
    syncUserFromStorage: (state) => {
      state.user = getUserFromStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload?.message || 'Registration successful.';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload?.requires2FA) {
          state.user = null;
          state.message = action.payload.message || 'Two-factor authentication is required.';
          return;
        }

        state.user = action.payload;
        state.message = '';
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // GOOGLE AUTH
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        if (action.payload?.requires2FA) {
          state.user = null;
          state.message = action.payload.message || 'Two-factor authentication is required.';
          return;
        }

        if (action.payload?.token || action.payload?.accessToken) {
          state.user = action.payload;
          state.message = '';
          return;
        }

        state.user = null;
        state.message = action.payload?.message || 'Google authentication completed.';
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // PROFILE
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      });
  },
});

// -----------------------------------------------------------------------------
// 🚀 EXPORTS
// -----------------------------------------------------------------------------
export const { reset, syncUserFromStorage } = authSlice.actions;
export default authSlice.reducer;