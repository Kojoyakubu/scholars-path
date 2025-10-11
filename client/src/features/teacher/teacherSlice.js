// src/features/teacher/teacherSlice.js (Revised)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teacherService from './teacherService';

const initialState = {
  lessonNotes: [],
  quizzes: [],
  resources: [],
  analytics: {},
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Generic thunk creator - simplified as token is now handled by the service layer
const createTeacherThunk = (name, serviceCall) => {
  return createAsyncThunk(`teacher/${name}`, async (arg, thunkAPI) => {
    try {
      return await serviceCall(arg);
    } catch (error)
 {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};

export const getMyLessonNotes = createTeacherThunk('getMyLessonNotes', teacherService.getMyLessonNotes);
export const generateLessonNote = createTeacherThunk('generateLessonNote', teacherService.generateLessonNote);
export const createQuiz = createTeacherThunk('createQuiz', teacherService.createQuiz);
export const uploadResource = createTeacherThunk('uploadResource', teacherService.uploadResource);
export const getTeacherAnalytics = createTeacherThunk('getTeacherAnalytics', teacherService.getTeacherAnalytics);
// Other thunks would follow this pattern...

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    resetTeacherState: (state) => {
      // Reset status flags but keep the data
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyLessonNotes.fulfilled, (state, action) => {
        state.lessonNotes = action.payload;
      })
      .addCase(generateLessonNote.fulfilled, (state, action) => {
        state.isSuccess = true;
        // Add the new note to the beginning of the array
        state.lessonNotes.unshift(action.payload);
        state.message = 'Lesson Note Generated Successfully!';
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.quizzes.push(action.payload.quiz);
        state.message = action.payload.message;
      })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.resources.push(action.payload);
        state.message = 'Resource Uploaded Successfully!';
      })
      .addCase(getTeacherAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      // Generic matchers for pending and rejected states
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.isSuccess = false; // Reset success flag on new action
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
        }
      );
  },
});

export const { resetTeacherState } = teacherSlice.actions;
export default teacherSlice.reducer;