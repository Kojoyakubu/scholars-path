import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://scholars-path-backend.onrender.com/api/student/';

const createApiThunk = (name, url, method = 'get') => {
  return createAsyncThunk(`student/${name}`, async (data, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let response;
      if (method === 'post') {
        response = await axios.post(API_URL + `${url}/${data.quizId}/submit`, { answers: data.answers }, config);
      } else {
        response = await axios.get(API_URL + `${url}/${data}`, config);
      }
      return response.data;
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};

export const getLearnerNotes = createApiThunk('getLearnerNotes', 'notes');
export const getQuizzes = createApiThunk('getQuizzes', 'quizzes');
export const getResources = createApiThunk('getResources', 'resources');
export const getQuizDetails = createApiThunk('getQuizDetails', 'quiz');
export const submitQuiz = createApiThunk('submitQuiz', 'quiz', 'post');
export const getMyBadges = createApiThunk('getMyBadges', 'my-badges');

export const logNoteView = createAsyncThunk('student/logNoteView', async (noteId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(API_URL + `notes/${noteId}/view`, {}, config);
    return noteId;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    notes: [],
    quizzes: [],
    resources: [],
    currentQuiz: null,
    quizResult: null,
    badges: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetQuiz: (state) => {
      state.currentQuiz = null;
      state.quizResult = null;
    }
  },
  extraReducers: (builder) => {
    const thunks = [
      { thunk: getLearnerNotes, stateKey: 'notes' },
      { thunk: getQuizzes, stateKey: 'quizzes' },
      { thunk: getResources, stateKey: 'resources' },
      { thunk: getQuizDetails, stateKey: 'currentQuiz' },
      { thunk: submitQuiz, stateKey: 'quizResult' },
      { thunk: getMyBadges, stateKey: 'badges' },
    ];
    thunks.forEach(({ thunk, stateKey }) => {
      builder
        .addCase(thunk.pending, (state) => { state.isLoading = true; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state[stateKey] = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        });
    });
    // Add case for logging a note view
    builder.addCase(logNoteView.fulfilled, (state, action) => {
      console.log(`Logged view for note: ${action.payload}`);
    });
  },
});

export const { resetQuiz } = studentSlice.actions;
export default studentSlice.reducer;