// src/features/school/schoolSlice.js (Revised)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import schoolService from './schoolService';

const initialState = {
  dashboardData: null,
  isLoading: false,
  isError: false,
  isSuccess: false, // Added for consistency
  message: '',
};

// --- Async Thunk (Simplified) ---
export const getSchoolDashboard = createAsyncThunk(
  'school/getDashboard',
  async (schoolId, thunkAPI) => {
    try {
      // The service call is now much simpler
      return await schoolService.getSchoolDashboard(schoolId);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- School Slice ---
const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    resetSchoolState: (state) => {
      state.dashboardData = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSchoolDashboard.fulfilled, (state, action) => {
        state.dashboardData = action.payload;
        state.isSuccess = true;
      })
      // Use addMatcher for generic cases
      .addMatcher(
        (action) => action.type.startsWith('school/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('school/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('school/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { resetSchoolState } = schoolSlice.actions;
export default schoolSlice.reducer;