// client/src/features/curriculum/curriculumSlice.js (Corrected and Final Version)

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

// --- CORRECTED Async Thunks ---
// The generic helper has been removed to handle arguments correctly.

const handleError = (error, thunkAPI) => {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
};

// This thunk now correctly extracts the 'entity' string from the payload.
export const fetchItems = createAsyncThunk('curriculum/fetchItems', async ({ entity }, thunkAPI) => {
    try {
        const data = await curriculumService.getItems(entity);
        return { entity, data }; // Return both so the reducer knows which array to update
    } catch (error) {
        return handleError(error, thunkAPI);
    }
});

// This thunk was already correct, but is included for completeness.
export const fetchChildren = createAsyncThunk('curriculum/fetchChildren', async (arg, thunkAPI) => {
    try {
        const data = await curriculumService.getChildrenOf(arg);
        return { entity: arg.entity, data };
    } catch (error) {
        return handleError(error, thunkAPI);
    }
});

export const createItem = createAsyncThunk('curriculum/createItem', async (arg, thunkAPI) => {
    try {
        const data = await curriculumService.createItem(arg);
        return { entity: arg.entity, data };
    } catch (error) {
        return handleError(error, thunkAPI);
    }
});

export const updateItem = createAsyncThunk('curriculum/updateItem', async (arg, thunkAPI) => {
    try {
        const data = await curriculumService.updateItem(arg);
        return { entity: arg.entity, data };
    } catch (error) {
        return handleError(error, thunkAPI);
    }
});

// This thunk also needed correction to pass only the itemId string to the service.
export const deleteItem = createAsyncThunk('curriculum/deleteItem', async ({ entity, itemId }, thunkAPI) => {
    try {
        await curriculumService.deleteItem({ entity, itemId });
        return { entity, itemId }; // Return what's needed for the reducer
    } catch (error) {
        return handleError(error, thunkAPI);
    }
});


// --- Curriculum Slice ---
const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {
    resetCurriculumState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    clearChildren: (state, action) => {
      const { entities } = action.payload;
      entities.forEach(entity => { state[entity] = []; });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled cases
      .addCase(fetchItems.fulfilled, (state, action) => { state[action.payload.entity] = action.payload.data; })
      .addCase(fetchChildren.fulfilled, (state, action) => { state[action.payload.entity] = action.payload.data; })
      .addCase(createItem.fulfilled, (state, action) => { state[action.payload.entity].push(action.payload.data); })
      .addCase(updateItem.fulfilled, (state, action) => {
        const items = state[action.payload.entity];
        const index = items.findIndex(item => item._id === action.payload.data._id);
        if (index !== -1) { items[index] = action.payload.data; }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state[action.payload.entity] = state[action.payload.entity].filter(item => item._id !== action.payload.itemId);
      })
      // Generic matchers for pending, fulfilled, and rejected states
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/pending'), (state) => { state.isLoading = true; })
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/fulfilled'), (state) => { state.isLoading = false; state.isError = false; state.message = ''; })
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/rejected'), (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; });
  },
});

export const { resetCurriculumState, clearChildren } = curriculumSlice.actions;
export default curriculumSlice.reducer;