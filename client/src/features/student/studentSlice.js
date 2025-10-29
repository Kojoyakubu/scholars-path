import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentService from './studentService';

// --- Initial State ---
const initialState = {
  badges: [],
  aiInsights: null, // ✅ Added for AI Insights
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// --- Async Thunks ---
export const getMyBadges = createAsyncThunk('student/getMyBadges', async (_, thunkAPI) => {
  try {
    return await studentService.getMyBadges();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// 🧠 NEW: Fetch AI insights for the student
export const getAiInsights = createAsyncThunk('student/getAiInsights', async (_, thunkAPI) => {
  try {
    return await studentService.getAiInsights();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// --- Slice ---
export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    resetStudentState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // getMyBadges
      .addCase(getMyBadges.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyBadges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.badges = action.payload;
      })
      .addCase(getMyBadges.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // 🧠 getAiInsights
      .addCase(getAiInsights.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAiInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.aiInsights = action.payload;
      })
      .addCase(getAiInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetStudentState } = studentSlice.actions;
export default studentSlice.reducer;
