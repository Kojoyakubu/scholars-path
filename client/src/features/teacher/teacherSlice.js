import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teacherService from './teacherService';

const initialState = {
  lessonNotes: [],
  draftLearnerNotes: [],
  quizzes: [],
  currentNote: null,
  analytics: {},
  aiInsights: null,
  bundleResult: null, // ✅ NEW: Store the complete lesson bundle
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Helper for consistent async thunks
const createTeacherThunk = (name, serviceCall) =>
  createAsyncThunk(`teacher/${name}`, async (arg, thunkAPI) => {
    try {
      return await serviceCall(arg);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });

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
export const getAiInsights = createTeacherThunk('getAiInsights', teacherService.getAiInsights); // new
export const generateLessonBundle = createTeacherThunk('generateLessonBundle', teacherService.generateLessonBundle); // ✅ NEW: Bundle generation

export const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    resetTeacherState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetCurrentNote: (state) => {
      state.currentNote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyLessonNotes.fulfilled, (state, action) => {
        state.lessonNotes = action.payload;
        state.isSuccess = true;
      })
      .addCase(generateLessonNote.fulfilled, (state, action) => {
        state.lessonNotes.unshift(action.payload);
        state.isSuccess = true;
        state.message = 'Lesson note generated successfully!';
      })
      .addCase(getLessonNoteById.fulfilled, (state, action) => {
        state.currentNote = action.payload;
        state.isSuccess = true;
      })
      .addCase(deleteLessonNote.fulfilled, (state, action) => {
        state.lessonNotes = state.lessonNotes.filter(
          (note) => note._id !== action.payload.id
        );
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(generateLearnerNote.fulfilled, (state, action) => {
        state.draftLearnerNotes.unshift(action.payload);
        state.isSuccess = true;
        state.message = 'Learner note generated successfully!';
      })
      .addCase(getDraftLearnerNotes.fulfilled, (state, action) => {
        state.draftLearnerNotes = action.payload;
        state.isSuccess = true;
      })
      .addCase(publishLearnerNote.fulfilled, (state, action) => {
        state.draftLearnerNotes = state.draftLearnerNotes.filter(
          (note) => note._id !== action.payload.id
        );
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(deleteLearnerNote.fulfilled, (state, action) => {
        state.draftLearnerNotes = state.draftLearnerNotes.filter(
          (note) => note._id !== action.payload.id
        );
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(generateAiQuiz.fulfilled, (state, action) => {
        state.quizzes.unshift(action.payload);
        state.isSuccess = true;
        state.message = 'AI Quiz generated successfully!';
      })

      // ✅ THE FIX IS HERE: This case was missing
      .addCase(getTeacherAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
        state.isSuccess = true;
      })

      // 🧠 AI Insights fulfilled
      .addCase(getAiInsights.fulfilled, (state, action) => {
        state.aiInsights = action.payload;
      })

      // 🎓 NEW: Lesson Bundle fulfilled
      .addCase(generateLessonBundle.fulfilled, (state, action) => {
        state.bundleResult = action.payload;
        state.isSuccess = true;
        state.message = 'Lesson bundle generated successfully!';
      })

      // Generic loaders
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.isSuccess = false;
          state.isError = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { resetTeacherState, resetCurrentNote } = teacherSlice.actions;
export default teacherSlice.reducer;