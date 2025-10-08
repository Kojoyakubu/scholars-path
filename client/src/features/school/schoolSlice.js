import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/school/';

export const getSchoolDashboard = createAsyncThunk('school/getDashboard', async (schoolId, thunkAPI) => { // Now accepts schoolId
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + `dashboard/${schoolId}`, config); // Use schoolId in URL
    return response.data;
  } catch (error) { /* ... */ }
});

const schoolSlice = createSlice({
  name: 'school',
  initialState: {
    dashboardData: null,
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {},
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

export default schoolSlice.reducer;