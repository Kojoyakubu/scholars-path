// src/features/school/schoolSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import schoolService from './schoolService';

const initialState = {
  dashboardData: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

export const getSchoolDashboard = createAsyncThunk('school/getDashboard', async (schoolId, thunkAPI) => {
  try {
    return await schoolService.getSchoolDashboard(schoolId);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

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
      .addCase(getSchoolDashboard.fulfilled, (s, a) => {
        s.dashboardData = a.payload;
        s.isSuccess = true;
      })
      .addMatcher((a) => a.type.startsWith('school/') && a.type.endsWith('/pending'), (s) => (s.isLoading = true))
      .addMatcher((a) => a.type.startsWith('school/') && a.type.endsWith('/fulfilled'), (s) => (s.isLoading = false))
      .addMatcher((a) => a.type.startsWith('school/') && a.type.endsWith('/rejected'), (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      });
  },
});

export const { resetSchoolState } = schoolSlice.actions;
export default schoolSlice.reducer;
