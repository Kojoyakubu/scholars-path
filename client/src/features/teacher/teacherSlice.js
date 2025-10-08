import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/teacher/';
const STUDENT_API_URL = '/api/student/';

export const generateLessonNote = createAsyncThunk('teacher/generateNote', async (noteData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'generate-note', noteData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const generateLearnerNote = createAsyncThunk('teacher/generateLearnerNote', async (noteData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'generate-learner-note', noteData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createQuiz = createAsyncThunk('teacher/createQuiz', async (quizData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'create-quiz', quizData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const generateAiQuestion = createAsyncThunk('teacher/generateAiQuestion', async (questionData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'generate-ai-question', questionData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const uploadResource = createAsyncThunk('teacher/uploadResource', async (resourceData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'upload-resource', resourceData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getResources = createAsyncThunk('teacher/getResources', async (subStrandId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(STUDENT_API_URL + `resources/${subStrandId}`, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const generateAiQuizSection = createAsyncThunk('teacher/generateAiQuizSection', async (wizardData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'generate-ai-quiz-section', wizardData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getTeacherAnalytics = createAsyncThunk('teacher/getAnalytics', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'analytics', config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const teacherSlice = createSlice({
  name: 'teacher',
  initialState: {
    lessonNotes: [],
    quizzes: [],
    resources: [],
    analytics: {},
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
  },
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
      .addCase(generateLessonNote.pending, (state) => { state.isLoading = true; })
      .addCase(generateLessonNote.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.lessonNotes.push(action.payload); state.message = 'Lesson Note Generated!';
      })
      .addCase(generateLessonNote.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(generateLearnerNote.pending, (state) => { state.isLoading = true; })
      .addCase(generateLearnerNote.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.message = 'Learner Note Generated!';
      })
      .addCase(generateLearnerNote.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(createQuiz.pending, (state) => { state.isLoading = true; state.isSuccess = false; })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.quizzes.push(action.payload.quiz); state.message = action.payload.message;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(generateAiQuestion.pending, (state) => { state.isLoading = true; })
      .addCase(generateAiQuestion.fulfilled, (state) => { state.isLoading = false; })
      .addCase(generateAiQuestion.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(uploadResource.pending, (state) => { state.isLoading = true; })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.resources.push(action.payload); state.message = 'Resource Uploaded!';
      })
      .addCase(uploadResource.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(getResources.pending, (state) => { state.isLoading = true; })
      .addCase(getResources.fulfilled, (state, action) => {
        state.isLoading = false; state.resources = action.payload;
      })
      .addCase(getResources.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(generateAiQuizSection.pending, (state) => { state.isLoading = true; })
      .addCase(generateAiQuizSection.fulfilled, (state) => { state.isLoading = false; })
      .addCase(generateAiQuizSection.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(getTeacherAnalytics.pending, (state) => { state.isLoading = true; })
      .addCase(getTeacherAnalytics.fulfilled, (state, action) => {
        state.isLoading = false; state.analytics = action.payload;
      })
      .addCase(getTeacherAnalytics.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      });
  },
});

export const { reset } = teacherSlice.actions;
export default teacherSlice.reducer;