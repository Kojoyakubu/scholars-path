import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

// --- Initial State ---
const initialState = {
  users: [],
  pages: 1,
  page: 1,
  stats: {},
  schools: [],
  levels: [], // ✨ NEW: For curriculum levels
  aiInsights: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// --- Async Thunks ---
// ... (all your existing thunks like getUsers, approveUser, etc. remain here)
export const getUsers = createAsyncThunk('admin/getUsers', async (pageNumber, thunkAPI) => {
  try {
    return await adminService.getUsers(pageNumber);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const approveUser = createAsyncThunk('admin/approveUser', async (userId, thunkAPI) => {
  try {
    return await adminService.approveUser(userId);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId, thunkAPI) => {
  try {
    return await adminService.deleteUser(userId);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const assignUserToSchool = createAsyncThunk('admin/assignUserToSchool', async (data, thunkAPI) => {
  try {
    return await adminService.assignUserToSchool(data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getStats = createAsyncThunk('admin/getStats', async (_, thunkAPI) => {
  try {
    return await adminService.getStats();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getSchools = createAsyncThunk('admin/getSchools', async (_, thunkAPI) => {
  try {
    return await adminService.getSchools();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createSchool = createAsyncThunk('admin/createSchool', async (schoolData, thunkAPI) => {
  try {
    return await adminService.createSchool(schoolData);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteSchool = createAsyncThunk('admin/deleteSchool', async (schoolId, thunkAPI) => {
  try {
    return await adminService.deleteSchool(schoolId);
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getAiInsights = createAsyncThunk('admin/getAiInsights', async (_, thunkAPI) => {
  try {
    return await adminService.getAiInsights();
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// ✨ NEW: Thunk for curriculum levels
export const getCurriculumLevels = createAsyncThunk('admin/getCurriculumLevels', async (_, thunkAPI) => {
    try {
      return await adminService.getCurriculumLevels();
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
});


// --- Slice ---
export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // ... (your existing builder cases for users, schools, etc. remain here)
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload.users || [];
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        const updatedId = action.payload.id || action.payload._id;
        const index = state.users.findIndex((user) => user._id === updatedId);
        if (index !== -1) {
          state.users[index].status = 'approved';
        }
        state.isSuccess = true;
        state.message = action.payload.message || 'User approved successfully';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(getSchools.fulfilled, (state, action) => {
        state.schools = action.payload;
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.schools.push(action.payload.school);
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.schools = state.schools.filter((s) => s._id !== action.payload);
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getAiInsights.fulfilled, (state, action) => {
        state.aiInsights = action.payload;
      })
      // ✨ NEW: Reducer for curriculum levels
      .addCase(getCurriculumLevels.fulfilled, (state, action) => {
          state.levels = action.payload.data || action.payload; // Adjust based on your API response structure
      })
      // Global state matchers (your existing setup is perfect)
      .addMatcher((a) => a.type.startsWith('admin/') && a.type.endsWith('/pending'), (s) => {
        s.isLoading = true;
      })
      .addMatcher((a) => a.type.startsWith('admin/') && a.type.endsWith('/fulfilled'), (s) => {
        s.isLoading = false;
      })
      .addMatcher((a) => a.type.startsWith('admin/') && a.type.endsWith('/rejected'), (s, a) => {
        s.isLoading = false;
        s.isError = true;
        s.message = a.payload;
      });
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;