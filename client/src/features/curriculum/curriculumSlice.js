import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import curriculumService from './curriculumService';

// (Initial state and async thunks are unchanged from the last version...)

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

// Simplified Async Thunks...
const createApiThunk = (name, serviceCall) => {
  return createAsyncThunk(`curriculum/${name}`, async (arg, thunkAPI) => {
    try { return await serviceCall(arg); } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue({ message, entity: arg?.entity });
    }
  });
};
export const fetchItems = createApiThunk('fetchItems', curriculumService.getItems);
export const fetchChildren = createApiThunk('fetchChildren', curriculumService.getChildrenOf);
export const createItem = createApiThunk('createItem', curriculumService.createItem);
export const updateItem = createApiThunk('updateItem', curriculumService.updateItem);
export const deleteItem = createApiThunk('deleteItem', curriculumService.deleteItem);


const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {
    // THE FIX IS HERE: Renamed for clarity and to avoid conflicts
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
    // (extraReducers logic is unchanged from the last version...)
    builder
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
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/pending'), (state) => { state.isLoading = true; })
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/fulfilled'), (state) => { state.isLoading = false; state.isError = false; state.message = ''; })
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/rejected'), (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload.message; });
  },
});

// THE FIX IS HERE: Export the new action name
export const { resetCurriculumState, clearChildren } = curriculumSlice.actions;
export default curriculumSlice.reducer;