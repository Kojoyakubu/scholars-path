import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teacherService from './teacherService';

const initialState = {
  lessonNotes: [],
  draftLearnerNotes: [],
  quizzes: [],
  currentNote: null,
  analytics: {},
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Helper to create async thunks and handle errors consistently
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
export const generateLearnerNote = createTeacherThunk('generateLearnerNote', teacherService.generateLearnerNote);
export const getTeacherAnalytics = createTeacherThunk('getTeacherAnalytics', teacherService.getTeacherAnalytics);
export const getDraftLearnerNotes = createTeacherThunk('getDraftLearnerNotes', teacherService.getDraftLearnerNotes);
export const publishLearnerNote = createTeacherThunk('publishLearnerNote', teacherService.publishLearnerNote);
export const deleteLearnerNote = createTeacherThunk('deleteLearnerNote', teacherService.deleteLearnerNote);
export const generateAiQuiz = createTeacherThunk('generateAiQuiz', teacherService.generateAiQuiz);

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
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
      .addCase(getMyLessonNotes.fulfilled, (state, action) => {
        state.lessonNotes = action.payload;
      })
      .addCase(getLessonNoteById.fulfilled, (state, action) => {
        state.currentNote = action.payload;
      })
      .addCase(getTeacherAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(generateLessonNote.fulfilled, (state, action) => {
        state.lessonNotes.unshift(action.payload);
        state.isSuccess = true;
        state.message = 'Lesson Note Generated Successfully!';
      })
      .addCase(deleteLessonNote.fulfilled, (state, action) => {
        state.lessonNotes = state.lessonNotes.filter(
          (note) => note._id !== action.payload.id
        );
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(generateLearnerNote.fulfilled, (state, action) => {
        state.draftLearnerNotes.unshift(action.payload.learnerNote);
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(getDraftLearnerNotes.fulfilled, (state, action) => {
        state.draftLearnerNotes = action.payload;
      })
      .addCase(publishLearnerNote.fulfilled, (state, action) => {
        // Remove the note from the drafts list once it's published
        state.draftLearnerNotes = state.draftLearnerNotes.filter(note => note._id !== action.payload.id);
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(deleteLearnerNote.fulfilled, (state, action) => {
        state.draftLearnerNotes = state.draftLearnerNotes.filter(note => note._id !== action.payload.id);
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(generateAiQuiz.fulfilled, (state, action) => {
        state.quizzes.unshift(action.payload); // Add the new quiz to the list
        state.isSuccess = true;
        state.message = "AI Quiz generated successfully!";
      })

      // Generic matchers for handling loading and error states
      .addMatcher((action) => action.type.startsWith('teacher/') && action.type.endsWith('/pending'), (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addMatcher((action) => action.type.startsWith('teacher/') && action.type.endsWith('/fulfilled'), (state) => {
        state.isLoading = false;
      })
      .addMatcher((action) => action.type.startsWith('teacher/') && action.type.endsWith('/rejected'), (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetTeacherState, resetCurrentNote } = teacherSlice.actions;
export default teacherSlice.reducer;