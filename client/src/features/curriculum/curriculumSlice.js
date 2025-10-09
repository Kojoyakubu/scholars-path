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

export const fetchItems = createAsyncThunk('curriculum/fetchItems', async (entity, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const data = await curriculumService.getItems(entity, token);
    return { entity, data };
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue({ message, entity });
  }
});

// ADD THIS THUNK
export const fetchChildren = createAsyncThunk('curriculum/fetchChildren', async ({ entity, parentEntity, parentId }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const data = await curriculumService.getChildrenOf({ entity, parentEntity, parentId }, token);
        return { entity, data };
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue({ message, entity });
    }
});


export const createItem = createAsyncThunk('curriculum/createItem', async ({ entity, itemData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const data = await curriculumService.createItem(entity, itemData, token);
    return { entity, data };
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue({ message, entity });
  }
});

export const updateItem = createAsyncThunk('curriculum/updateItem', async ({ entity, itemData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const data = await curriculumService.updateItem(entity, itemData, token);
    return { entity, data };
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue({ message, entity });
  }
});

export const deleteItem = createAsyncThunk('curriculum/deleteItem', async ({ entity, itemId }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const deletedItemId = await curriculumService.deleteItem(entity, itemId, token);
    return { entity, itemId: deletedItemId };
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue({ message, entity });
  }
});


const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
    };
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    };

    builder
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state[action.payload.entity] = action.payload.data;
      })
      // ADD THIS CASE
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.isLoading = false;
        state[action.payload.entity] = action.payload.data;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state[action.payload.entity].push(action.payload.data);
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const items = state[action.payload.entity];
        const index = items.findIndex(item => item._id === action.payload.data._id);
        if (index !== -1) {
          items[index] = action.payload.data;
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state[action.payload.entity] = state[action.payload.entity].filter(
          item => item._id !== action.payload.itemId
        );
      })
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/pending'), handlePending)
      .addMatcher((action) => action.type.startsWith('curriculum/') && action.type.endsWith('/rejected'), handleRejected);
  },
});

export const { reset } = curriculumSlice.actions;
export default curriculumSlice.reducer;