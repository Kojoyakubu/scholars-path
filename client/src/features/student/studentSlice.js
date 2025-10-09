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

// Generic thunk creator for most student actions
const createStudentThunk = (name, serviceCall) => {
  return createAsyncThunk(`student/${name}`, async (arg, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serviceCall(arg, token);
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
    reset: (state) => {
        state.isLoading = false;
        state.isError = false;
        state.message = '';
    },
    resetQuiz: (state) => {
      state.currentQuiz = null;
      state.quizResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLearnerNotes.fulfilled, (state, action) => { state.notes = action.payload; })
      .addCase(getQuizzes.fulfilled, (state, action) => { state.quizzes = action.payload; })
      .addCase(getResources.fulfilled, (state, action) => { state.resources = action.payload; })
      .addCase(getQuizDetails.fulfilled, (state, action) => { state.currentQuiz = action.payload; })
      .addCase(submitQuiz.fulfilled, (state, action) => { state.quizResult = action.payload; })
      .addCase(getMyBadges.fulfilled, (state, action) => { state.badges = action.payload; })
      .addCase(logNoteView.fulfilled, (state, action) => {
        console.log(`Logged view for note: ${action.meta.arg}`);
      })
      .addMatcher(
        (action) => action.type.startsWith('student/') && action.type.endsWith('/pending'),
        (state) => { state.isLoading = true; }
      )
      .addMatcher(
        (action) => action.type.startsWith('student/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('student/') && action.type.endsWith('/fulfilled'),
        (state) => { state.isLoading = false; }
      );
  },
});

export const { reset, resetQuiz } = studentSlice.actions;
export default studentSlice.reducer;