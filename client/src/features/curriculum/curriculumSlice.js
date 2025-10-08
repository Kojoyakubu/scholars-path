import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://scholars-path-backend.onrender.com/api/curriculum/';

// --- Helper for API calls ---
const createApiThunk = (name, url, method = 'get') => {
  return createAsyncThunk(`curriculum/${name}`, async (data, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let response;
      const id = data?.levelId || data?.classId || data?.subjectId || data?.strandId || data?.subStrandId || data;

      if (method === 'post') {
        response = await axios.post(API_URL + url, data, config);
      } else if (method === 'put') {
        response = await axios.put(API_URL + `${url}/${id}`, { name: data.name }, config);
      } else if (method === 'delete') {
        await axios.delete(API_URL + `${url}/${id}`, config);
        return id; // Return the ID on delete
      } else {
        response = await axios.get(API_URL + url, config);
      }
      return response.data;
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};

// --- Create ALL async thunks ---
export const getLevels = createApiThunk('getLevels', 'levels');
export const createLevel = createApiThunk('createLevel', 'levels', 'post');
export const updateLevel = createApiThunk('updateLevel', 'levels', 'put');
export const deleteLevel = createApiThunk('deleteLevel', 'levels', 'delete');

export const getClasses = createApiThunk('getClasses', 'classes');
export const createClass = createApiThunk('createClass', 'classes', 'post');
export const updateClass = createApiThunk('updateClass', 'classes', 'put');
export const deleteClass = createApiThunk('deleteClass', 'classes', 'delete');

export const getSubjects = createApiThunk('getSubjects', 'subjects');
export const createSubject = createApiThunk('createSubject', 'subjects', 'post');
export const updateSubject = createApiThunk('updateSubject', 'subjects', 'put');
export const deleteSubject = createApiThunk('deleteSubject', 'subjects', 'delete');

export const getStrands = createApiThunk('getStrands', 'strands');
export const createStrand = createApiThunk('createStrand', 'strands', 'post');
export const updateStrand = createApiThunk('updateStrand', 'strands', 'put');
export const deleteStrand = createApiThunk('deleteStrand', 'strands', 'delete');

export const getSubStrands = createApiThunk('getSubStrands', 'substrands');
export const createSubStrand = createApiThunk('createSubStrand', 'substrands', 'post');
export const updateSubStrand = createApiThunk('updateSubStrand', 'substrands', 'put');
export const deleteSubStrand = createApiThunk('deleteSubStrand', 'substrands', 'delete');

const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState: {
    levels: [],
    classes: [],
    subjects: [],
    strands: [],
    subStrands: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    const thunks = [
      { thunk: getLevels, stateKey: 'levels' },
      { thunk: createLevel, stateKey: 'levels', push: true },
      { thunk: updateLevel, stateKey: 'levels', update: true },
      { thunk: deleteLevel, stateKey: 'levels', del: true },
      { thunk: getClasses, stateKey: 'classes' },
      { thunk: createClass, stateKey: 'classes', push: true },
      { thunk: updateClass, stateKey: 'classes', update: true },
      { thunk: deleteClass, stateKey: 'classes', del: true },
      { thunk: getSubjects, stateKey: 'subjects' },
      { thunk: createSubject, stateKey: 'subjects', push: true },
      { thunk: updateSubject, stateKey: 'subjects', update: true },
      { thunk: deleteSubject, stateKey: 'subjects', del: true },
      { thunk: getStrands, stateKey: 'strands' },
      { thunk: createStrand, stateKey: 'strands', push: true },
      { thunk: updateStrand, stateKey: 'strands', update: true },
      { thunk: deleteStrand, stateKey: 'strands', del: true },
      { thunk: getSubStrands, stateKey: 'subStrands' },
      { thunk: createSubStrand, stateKey: 'subStrands', push: true },
      { thunk: updateSubStrand, stateKey: 'subStrands', update: true },
      { thunk: deleteSubStrand, stateKey: 'subStrands', del: true },
    ];

    thunks.forEach(({ thunk, stateKey, push, update, del }) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.isLoading = false;
          if (push) {
            state[stateKey].push(action.payload);
          } else if (update) {
            const index = state[stateKey].findIndex(item => item._id === action.payload._id);
            if (index !== -1) state[stateKey][index] = action.payload;
          } else if (del) {
            state[stateKey] = state[stateKey].filter(item => item._id !== action.payload);
          } else {
            state[stateKey] = action.payload;
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        });
    });
  },
});

export const { reset } = curriculumSlice.actions;
export default curriculumSlice.reducer;