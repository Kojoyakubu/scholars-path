import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentService from './studentService';

// --- Initial State ---
const initialState = {
  badges: [],
  learnerNotes: [],
  quizzes: [],
  resources: [],
  aiInsights: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// --- Async Thunks ---

// 🎓 Fetch learner's notes
export const getLearnerNotes = createAsyncThunk('student/getLearnerNotes', async (_, thunkAPI) => {
  try {
    return await studentService.getLearnerNotes();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// 🧠 Fetch AI Insights
export const getAiInsights = createAsyncThunk('student/getAiInsights', async (_, thunkAPI) => {
  try {
    return await studentService.getAiInsights();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// 🏅 Fetch badges
export const getMyBadges = createAsyncThunk('student/getMyBadges', async (_, thunkAPI) => {
  try {
    return await studentService.getMyBadges();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// 🧩 Fetch quizzes
export const getQuizzes = createAsyncThunk('student/getQuizzes', async (_, thunkAPI) => {
  try {
    return await studentService.getQuizzes();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// 📘 Fetch resources
export const getResources = createAsyncThunk('student/getResources', async (_, thunkAPI) => {
  try {
    return await studentService.getResources();
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
      // getLearnerNotes
      .addCase(getLearnerNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLearnerNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.learnerNotes = action.payload;
      })
      .addCase(getLearnerNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // getMyBadges
      .addCase(getMyBadges.fulfilled, (state, action) => {
        state.badges = action.payload;
        state.isSuccess = true;
      })

      // getQuizzes
      .addCase(getQuizzes.fulfilled, (state, action) => {
        state.quizzes = action.payload;
      })

      // getResources
      .addCase(getResources.fulfilled, (state, action) => {
        state.resources = action.payload;
      })

      // getAiInsights
      .addCase(getAiInsights.fulfilled, (state, action) => {
        state.aiInsights = action.payload;
      })

      // Generic pending/rejected matchers
      .addMatcher((a) => a.type.startsWith('student/') && a.type.endsWith('/pending'), (s) => {
        s.isLoading = true;
      })
      .addMatcher((a) => a.type.startsWith('student/') && a.type.endsWith('/fulfilled'), (s) => {
        s.isLoading = false;
      })
      .addMatcher((a) => a.type.startsWith('student/') && a.type.endsWith('/rejected'), (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      });
  },
});

export const { resetStudentState } = studentSlice.actions;
export default studentSlice.reducer;
