// src/features/student/studentSlice.js
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

const createStudentThunk = (name, serviceCall) =>
  createAsyncThunk(`student/${name}`, async (arg, thunkAPI) => {
    try {
      return await serviceCall(arg);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });

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
    resetStudentState: () => initialState,
    resetQuiz: (state) => {
      state.currentQuiz = null;
      state.quizResult = null;
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLearnerNotes.fulfilled, (s, a) => (s.notes = a.payload))
      .addCase(getQuizzes.fulfilled, (s, a) => (s.quizzes = a.payload))
      .addCase(getResources.fulfilled, (s, a) => (s.resources = a.payload))
      .addCase(getQuizDetails.fulfilled, (s, a) => (s.currentQuiz = a.payload))
      .addCase(submitQuiz.fulfilled, (s, a) => (s.quizResult = a.payload))
      .addCase(getMyBadges.fulfilled, (s, a) => (s.badges = a.payload))
      .addMatcher((a) => a.type.startsWith('student/') && a.type.endsWith('/pending'), (s) => (s.isLoading = true))
      .addMatcher((a) => a.type.startsWith('student/') && a.type.endsWith('/fulfilled'), (s) => {
        s.isLoading = false;
        s.isError = false;
        s.message = '';
      })
      .addMatcher((a) => a.type.startsWith('student/') && a.type.endsWith('/rejected'), (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      });
  },
});

export const { resetStudentState, resetQuiz } = studentSlice.actions;
export default studentSlice.reducer;
