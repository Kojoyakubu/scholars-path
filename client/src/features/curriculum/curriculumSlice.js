// /client/src/features/curriculum/curriculumSlice.js
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

const handleError = (error, thunkAPI) => {
  const message = error.response?.data?.message || error.message || error.toString();
  return thunkAPI.rejectWithValue(message);
};

// ✅ Fixed: Pass entity directly, not as object
export const fetchItems = createAsyncThunk(
  'curriculum/fetchItems',
  async ({ entity }, thunkAPI) => {
    try {
      console.log('🔍 Fetching curriculum items for:', entity);
      const data = await curriculumService.getItems(entity);
      console.log('✅ Data received for', entity, ':', data);
      return { entity, data };
    } catch (e) {
      console.error('❌ Error fetching', entity, ':', e);
      return handleError(e, thunkAPI);
    }
  }
);

export const fetchChildren = createAsyncThunk(
  'curriculum/fetchChildren',
  async (arg, thunkAPI) => {
    try {
      console.log('🔍 Fetching children:', arg);
      const data = await curriculumService.getChildrenOf(arg);
      console.log('✅ Children received:', data);
      return { entity: arg.entity, data };
    } catch (e) {
      console.error('❌ Error fetching children:', e);
      return handleError(e, thunkAPI);
    }
  }
);

export const createItem = createAsyncThunk(
  'curriculum/createItem',
  async (arg, thunkAPI) => {
    try {
      const data = await curriculumService.createItem(arg);
      return { entity: arg.entity, data };
    } catch (e) {
      return handleError(e, thunkAPI);
    }
  }
);

export const updateItem = createAsyncThunk(
  'curriculum/updateItem',
  async (arg, thunkAPI) => {
    try {
      const data = await curriculumService.updateItem(arg);
      return { entity: arg.entity, data };
    } catch (e) {
      return handleError(e, thunkAPI);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'curriculum/deleteItem',
  async ({ entity, itemId }, thunkAPI) => {
    try {
      await curriculumService.deleteItem({ entity, itemId });
      return { entity, itemId };
    } catch (e) {
      return handleError(e, thunkAPI);
    }
  }
);

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
      entities.forEach((e) => (state[e] = []));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.fulfilled, (s, a) => {
        console.log('📦 Storing', a.payload.entity, ':', a.payload.data);
        s[a.payload.entity] = a.payload.data;
      })
      .addCase(fetchChildren.fulfilled, (s, a) => {
        console.log('📦 Storing children', a.payload.entity, ':', a.payload.data);
        s[a.payload.entity] = a.payload.data;
      })
      .addCase(createItem.fulfilled, (s, a) => s[a.payload.entity].push(a.payload.data))
      .addCase(updateItem.fulfilled, (s, a) => {
        const i = s[a.payload.entity].findIndex((x) => x._id === a.payload.data._id);
        if (i !== -1) s[a.payload.entity][i] = a.payload.data;
      })
      .addCase(deleteItem.fulfilled, (s, a) => {
        s[a.payload.entity] = s[a.payload.entity].filter((x) => x._id !== a.payload.itemId);
      })
      .addMatcher(
        (a) => a.type.startsWith('curriculum/') && a.type.endsWith('/pending'),
        (s) => {
          s.isLoading = true;
          s.isError = false;
        }
      )
      .addMatcher(
        (a) => a.type.startsWith('curriculum/') && a.type.endsWith('/fulfilled'),
        (s) => {
          s.isLoading = false;
        }
      )
      .addMatcher(
        (a) => a.type.startsWith('curriculum/') && a.type.endsWith('/rejected'),
        (s, a) => {
          s.isLoading = false;
          s.isError = true;
          s.message = a.payload;
          console.error('❌ Curriculum error:', a.payload);
        }
      );
  },
});

export const { resetCurriculumState, clearChildren } = curriculumSlice.actions;
export default curriculumSlice.reducer;