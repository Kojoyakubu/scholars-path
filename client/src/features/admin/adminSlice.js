import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

// ================= INITIAL STATE =================
const initialState = {
  stats: {},
  aiInsights: null,
  overview: {},
  topTeachers: [],
  topStudents: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// ================= THUNKS =================

// Fetch admin stats
export const getStats = createAsyncThunk('admin/getStats', async (_, thunkAPI) => {
  try {
    return await adminService.getStats();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Fetch AI-generated insights
export const getAiInsights = createAsyncThunk('admin/getAiInsights', async (_, thunkAPI) => {
  try {
    return await adminService.getAiInsights();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// --- NEW: Analytics Overview ---
export const getAnalyticsOverview = createAsyncThunk('admin/getAnalyticsOverview', async (_, thunkAPI) => {
  try {
    return await adminService.getAnalyticsOverview();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// --- NEW: Top Teachers ---
export const getTopTeachers = createAsyncThunk('admin/getTopTeachers', async (_, thunkAPI) => {
  try {
    return await adminService.getTopTeachers();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// --- NEW: Top Students ---
export const getTopStudents = createAsyncThunk('admin/getTopStudents', async (_, thunkAPI) => {
  try {
    return await adminService.getTopStudents();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// ================= SLICE =================
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Stats ---
      .addCase(getStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload;
      })
      .addCase(getStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- AI Insights ---
      .addCase(getAiInsights.fulfilled, (state, action) => {
        state.aiInsights = action.payload;
      })

      // --- NEW: Analytics Overview ---
      .addCase(getAnalyticsOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
      })

      // --- NEW: Top Teachers ---
      .addCase(getTopTeachers.fulfilled, (state, action) => {
        state.topTeachers = action.payload;
      })

      // --- NEW: Top Students ---
      .addCase(getTopStudents.fulfilled, (state, action) => {
        state.topStudents = action.payload;
      });
  },
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;
