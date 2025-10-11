// src/features/auth/authSlice.js (Revised)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

// Attempt to get user from localStorage on initial load
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false, // This will track loading for any auth-related async action
  message: '',
};

// --- Async Thunks (Simplified) ---

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    return await authService.register(userData);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    return await authService.login(userData);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// The getMe thunk is now simpler as it doesn't need to pass the token
export const getMe = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
  try {
    const freshUserData = await authService.getMe();
    // Get the current user state to preserve the token
    const currentUser = thunkAPI.getState().auth.user;
    return { ...currentUser, ...freshUserData }; // Merge new data with existing, preserving token
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// The logout action is now an async thunk to handle potential side effects cleanly
export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
});


// --- Auth Slice ---

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // A general reset action to clear status flags
    reset: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message; // API returns { message: '...' }
      })

      // Login
      .addCase(login.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.user = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })

      // getMe (Fetch user profile)
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        // Also update localStorage so the user stays logged in with the new info
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(getMe.rejected, (state, action) => {
        // If getMe fails (e.g., token expired), log the user out
        state.user = null;
        authService.logout();
      })

      // Use addMatcher for generic pending/rejected/fulfilled cases to reduce boilerplate
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;