// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

const user = JSON.parse(localStorage.getItem('user'));
const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Async thunks
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    return await authService.register(userData);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    return await authService.login(userData);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
  try {
    const freshUserData = await authService.getMe();
    const currentUser = thunkAPI.getState().auth.user;
    return { ...currentUser, ...freshUserData };
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isSuccess = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        authService.logout();
      })
      .addMatcher((a) => a.type.startsWith('auth/') && a.type.endsWith('/pending'), (s) => (s.isLoading = true))
      .addMatcher((a) => a.type.startsWith('auth/') && a.type.endsWith('/fulfilled'), (s) => (s.isLoading = false))
      .addMatcher((a) => a.type.startsWith('auth/') && a.type.endsWith('/rejected'), (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
