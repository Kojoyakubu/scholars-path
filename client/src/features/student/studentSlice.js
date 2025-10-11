// src/features/student/studentSlice.js (Revised)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentService from './studentService';

const initialState = {
  notes: [],
  quizzes: [],
  resources: [],
  currentQuiz: null,
  quizResult: null,
  badges: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Generic thunk creator - now even simpler as token is handled automatically
const createStudentThunk = (name, serviceCall) => {
  return createAsyncThunk(`student/${name}`, async (arg, thunkAPI) => {
    try {
      return await serviceCall(arg);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};

export const getLearnerNotes = createStudentThunk('getLearnerNotes', studentService.getLearnerNotes);
export const getQuizzes = createStudentThunk('getQuizzes', studentService.getQuizzes);
export const getResources = createStudentThunk('getResources', studentService.getResources);
export const getQuizDetails = createStudentThunk('getQuizDetails', studentService.getQuizDetails);
export const submitQuiz = createStudentThunk('submitQuiz', studentService.submitQuiz);
export const getMyBadges = createStudentThunk('getMyBadges', studentService.getMyBadges);
export const logNoteView = createStudentThunk('logNoteView', studentService.logNoteView);


const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    resetStudentState: (state) => {
      // Return a copy of the initial state to reset everything
      return initialState;
    },
    resetQuiz: (state) => {
      state.currentQuiz = null;
      state.quizResult = null;
      state.isLoading = false; // Also reset loading status
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLearnerNotes.fulfilled, (state, action) => { state.notes = action.payload; })
      .addCase(getQuizzes.fulfilled, (state, action) => { state.quizzes = action.payload; })
      .addCase(getResources.fulfilled, (state, action) => { state.resources = action.payload; })
      .addCase(getQuizDetails.fulfilled, (state, action) => { state.currentQuiz = action.payload; })
      .addCase(submitQuiz.fulfilled, (state, action) => { state.quizResult = action.payload; })
      .addCase(getMyBadges.fulfilled, (state, action) => { state.badges = action.payload; })
      // logNoteView doesn't need to modify state, so no case is needed
      
      // Generic matchers for pending, fulfilled, and rejected states
      .addMatcher(
        (action) => action.type.startsWith('student/') && action.type.endsWith('/pending'),
        (state) => { 
          state.isLoading = true; 
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('student/') && action.type.endsWith('/fulfilled'),
        (state) => { 
          state.isLoading = false;
          state.isError = false; // Clear any previous errors on success
          state.message = '';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('student/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { resetStudentState, resetQuiz } = studentSlice.actions;
export default studentSlice.reducer;