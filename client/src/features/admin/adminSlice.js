// /client/src/features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

const initialState = {
  stats: null,
  users: [],
  schools: [],
  levels: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Async Thunks for fetching all data
export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, thunkAPI) => {
  try {
    return await adminService.getAdminStats();
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchAllUsers = createAsyncThunk('admin/fetchAllUsers', async (_, thunkAPI) => {
  try {
    return await adminService.getAllUsers();
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchAllSchools = createAsyncThunk('admin/fetchAllSchools', async (_, thunkAPI) => {
  try {
    return await adminService.getAllSchools();
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchCurriculumLevels = createAsyncThunk('admin/fetchLevels', async (_, thunkAPI) => {
  try {
    return await adminService.getCurriculumLevels();
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});


export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    // Generic pending and rejected cases for all thunks
    builder
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      )
      // Fulfilled cases
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload.data; // Assuming data is nested in a `data` property
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.users || action.payload.data;
      })
      .addCase(fetchAllSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.schools = action.payload.data || action.payload;
      })
      .addCase(fetchCurriculumLevels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.levels = action.payload.data || action.payload;
      });
  },
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;