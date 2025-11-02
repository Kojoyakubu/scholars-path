// /client/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

// -----------------------------------------------------------------------------
// 🧩 INITIAL STATE
// -----------------------------------------------------------------------------
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user || null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// -----------------------------------------------------------------------------
// 🔐 REGISTER
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
// 🔑 LOGIN
// -----------------------------------------------------------------------------
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const user = await authService.login(userData); // ✅ only user object
      return user;
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
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
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
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
      });
  },
});

// -----------------------------------------------------------------------------
// 🚀 EXPORTS
// -----------------------------------------------------------------------------
export const { reset } = authSlice.actions;
export default authSlice.reducer;
