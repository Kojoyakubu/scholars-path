import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

// --- Initial State ---
const initialState = {
  users: [],
  pages: 1,
  page: 1,
  stats: {},
  schools: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// --- Async Thunks ---
export const getUsers = createAsyncThunk('admin/getUsers', async (pageNumber, thunkAPI) => {
  try {
    return await adminService.getUsers(pageNumber);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const approveUser = createAsyncThunk('admin/approveUser', async (userId, thunkAPI) => {
  try {
    return await adminService.approveUser(userId);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId, thunkAPI) => {
  try {
    return await adminService.deleteUser(userId);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const assignUserToSchool = createAsyncThunk('admin/assignUserToSchool', async (data, thunkAPI) => {
  try {
    return await adminService.assignUserToSchool(data);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getStats = createAsyncThunk('admin/getStats', async (_, thunkAPI) => {
  try {
    return await adminService.getStats();
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getSchools = createAsyncThunk('admin/getSchools', async (_, thunkAPI) => {
  try {
    return await adminService.getSchools();
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createSchool = createAsyncThunk('admin/createSchool', async (schoolData, thunkAPI) => {
  try {
    return await adminService.createSchool(schoolData);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteSchool = createAsyncThunk('admin/deleteSchool', async (schoolId, thunkAPI) => {
  try {
    return await adminService.deleteSchool(schoolId);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});


// --- Admin Slice ---
export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      
      // ✅ CORRECTED approveUser LOGIC
      .addCase(approveUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index].status = 'approved';
        }
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      
      // assignUserToSchool (returns the full user object)
      .addCase(assignUserToSchool.fulfilled, (state, action) => {
        state.users = state.users.map(user => 
            user._id === action.payload._id ? action.payload : user
        );
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      
      // getStats
      .addCase(getStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // getSchools
      .addCase(getSchools.fulfilled, (state, action) => {
        state.schools = action.payload;
      })
      
      // createSchool
      .addCase(createSchool.fulfilled, (state, action) => {
        state.schools.push(action.payload.school);
      })
      
      // deleteSchool
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.schools = state.schools.filter((school) => school._id !== action.payload);
      })

      // Generic matchers for handling loading and error states
      .addMatcher((action) => action.type.startsWith('admin/') && action.type.endsWith('/pending'), (state) => {
        state.isLoading = true;
      })
      .addMatcher((action) => action.type.startsWith('admin/') && action.type.endsWith('/fulfilled'), (state) => {
        state.isLoading = false;
      })
      .addMatcher((action) => action.type.startsWith('admin/') && action.type.endsWith('/rejected'), (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;