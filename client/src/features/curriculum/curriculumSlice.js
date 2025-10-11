// src/features/curriculum/curriculumSlice.js (Revised)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import curriculumService from './curriculumService';

const initialState = {
  levels: [],
  classes: [],
  subjects: [],
  strands: [],
  subStrands: [],
  isLoading: false,
  isError: false,
  message: '',
};

// --- Async Thunks (Simplified) ---
// Thunks now pass a single object to the service, and no token logic is needed.

const createApiThunk = (name, serviceCall) => {
  return createAsyncThunk(`curriculum/${name}`, async (arg, thunkAPI) => {
    try {
      return await serviceCall(arg);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue({ message, entity: arg.entity });
    }
  });
};

export const fetchItems = createApiThunk('fetchItems', curriculumService.getItems);
export const fetchChildren = createApiThunk('fetchChildren', curriculumService.getChildrenOf);
export const createItem = createApiThunk('createItem', curriculumService.createItem);
export const updateItem = createApiThunk('updateItem', curriculumService.updateItem);
export const deleteItem = createApiThunk('deleteItem', curriculumService.deleteItem);


// --- Curriculum Slice ---

const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    // Allows clearing specific parts of the curriculum tree, e.g., when a user selects a new level
    clearChildren: (state, action) => {
      const { entities } = action.payload; // e.g., ['classes', 'subjects', 'strands']
      entities.forEach(entity => {
        state[entity] = [];
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled cases for fetching data
      .addCase(fetchItems.fulfilled, (state, action) => {
        const { entity, data } = action.payload;
        state[entity] = data;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        const { entity, data } = action.payload;
        state[entity] = data;
      })

      // Fulfilled cases for mutations
      .addCase(createItem.fulfilled, (state, action) => {
        const { entity, data } = action.payload;
        state[entity].push(data);
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const { entity, data } = action.payload;
        const items = state[entity];
        const index = items.findIndex(item => item._id === data._id);
        if (index !== -1) {
          items[index] = data;
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { entity, itemId } = action.payload;
        state[entity] = state[entity].filter(item => item._id !== itemId);
      })

      // Generic matchers for pending, fulfilled, and rejected states
      .addMatcher(
        (action) => action.type.startsWith('curriculum/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('curriculum/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
          state.isError = false;
          state.message = '';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('curriculum/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload.message;
        }
      );
  },
});

export const { reset, clearChildren } = curriculumSlice.actions;
export default curriculumSlice.reducer;