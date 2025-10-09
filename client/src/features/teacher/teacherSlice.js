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

const createTeacherThunk = (name, serviceCall) => {
  return createAsyncThunk(`teacher/${name}`, async (arg, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serviceCall(arg, token);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};

export const generateLessonNote = createTeacherThunk('generateLessonNote', teacherService.generateLessonNote);
export const generateLearnerNote = createTeacherThunk('generateLearnerNote', teacherService.generateLearnerNote);
export const createQuiz = createTeacherThunk('createQuiz', teacherService.createQuiz);
export const generateAiQuestion = createTeacherThunk('generateAiQuestion', teacherService.generateAiQuestion);
export const uploadResource = createTeacherThunk('uploadResource', teacherService.uploadResource);
export const getResources = createTeacherThunk('getResources', teacherService.getResources);
export const generateAiQuizSection = createTeacherThunk('generateAiQuizSection', teacherService.generateAiQuizSection);
export const getTeacherAnalytics = createTeacherThunk('getTeacherAnalytics', teacherService.getTeacherAnalytics);


const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateLessonNote.fulfilled, (state, action) => {
        state.isSuccess = true; 
        state.lessonNotes.push(action.payload); 
        state.message = 'Lesson Note Generated!';
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isSuccess = true; 
        state.quizzes.push(action.payload.quiz); 
        state.message = action.payload.message;
      })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.isSuccess = true; 
        state.resources.push(action.payload); 
        state.message = 'Resource Uploaded!';
      })
      .addCase(getResources.fulfilled, (state, action) => {
        state.resources = action.payload;
      })
      .addCase(getTeacherAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
       .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/pending'),
        (state) => { 
          state.isLoading = true;
          state.isSuccess = false;
          state.isError = false;
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
        (state) => { state.isLoading = false; }
      );
  },
});

export const { reset } = teacherSlice.actions;
export default teacherSlice.reducer;