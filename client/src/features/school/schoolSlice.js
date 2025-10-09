import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import schoolService from './schoolService';

const initialState = {
  dashboardData: null,
  isLoading: false,
  isError: false,
  message: '',
};

export const getSchoolDashboard = createAsyncThunk('school/getDashboard', async (schoolId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await schoolService.getSchoolDashboard(schoolId, token);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
      reset: (state) => {
          state.dashboardData = null;
          state.isLoading = false;
          state.isError = false;
          state.message = '';
      }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSchoolDashboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSchoolDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(getSchoolDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = schoolSlice.actions;
export default schoolSlice.reducer;