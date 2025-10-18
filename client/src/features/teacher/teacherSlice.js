import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teacherService from './teacherService';

// --- Initial State ---
const initialState = {
  lessonNotes: [],
  currentNote: null,
  analytics: {},
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// --- Thunk Creator Helper ---
const createTeacherThunk = (name, serviceCall) => {
  return createAsyncThunk(`teacher/${name}`, async (arg, thunkAPI) => {
    try {
      return await serviceCall(arg);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};

// --- Async Thunks ---
export const getMyLessonNotes = createTeacherThunk('getMyLessonNotes', teacherService.getMyLessonNotes);
export const generateLessonNote = createTeacherThunk('generateLessonNote', teacherService.generateLessonNote);
export const getLessonNoteById = createTeacherThunk('getLessonNoteById', teacherService.getLessonNoteById);
export const deleteLessonNote = createTeacherThunk('deleteLessonNote', teacherService.deleteLessonNote);
export const getTeacherAnalytics = createTeacherThunk('getTeacherAnalytics', teacherService.getTeacherAnalytics);
// Add other thunks like createQuiz if needed

// --- Teacher Slice ---
const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    // Resets flags for the next operation
    resetTeacherState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetCurrentNote: (state) => {
      state.currentNote = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Specific fulfilled cases for data handling
      .addCase(getMyLessonNotes.fulfilled, (state, action) => { state.lessonNotes = action.payload; })
      .addCase(getLessonNoteById.fulfilled, (state, action) => { state.currentNote = action.payload; })
      .addCase(getTeacherAnalytics.fulfilled, (state, action) => { state.analytics = action.payload; })
      .addCase(generateLessonNote.fulfilled, (state, action) => {
        state.lessonNotes.unshift(action.payload); // Add to the top of the list
        state.isSuccess = true;
        state.message = 'Lesson Note Generated Successfully!';
      })
      .addCase(deleteLessonNote.fulfilled, (state, action) => {
        state.lessonNotes = state.lessonNotes.filter((note) => note._id !== action.payload.id);
        state.isSuccess = true;
        state.message = action.payload.message;
      })

      // Generic matchers for handling loading and error states
      .addMatcher((action) => action.type.startsWith('teacher/') && action.type.endsWith('/pending'), (state) => {
        state.isLoading = true;
      })
      .addMatcher((action) => action.type.startsWith('teacher/') && action.type.endsWith('/fulfilled'), (state) => {
        state.isLoading = false;
        state.isError = false; // Always reset error on success
        state.message = ''; // Clear old error messages
      })
      .addMatcher((action) => action.type.startsWith('teacher/') && action.type.endsWith('/rejected'), (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
      });
  },
});

export const { resetTeacherState, resetCurrentNote } = teacherSlice.actions;
export default teacherSlice.reducer;