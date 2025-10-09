import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

const initialState = {
  users: [],
  pages: 1,
  page: 1,
  stats: {},
  schools: [],
  isLoading: false,
  isError: false,
  message: '',
};

// --- Thunks that require an argument (e.g., an ID or page number) ---
const createAdminThunkWithArg = (name, serviceCall) => {
  return createAsyncThunk(`admin/${name}`, async (arg, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serviceCall(arg, token);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};

// --- Thunks that DON'T require an argument ---
const createAdminThunkWithoutArg = (name, serviceCall) => {
  return createAsyncThunk(`admin/${name}`, async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await serviceCall(token);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });
};


// Use the correct helper for each thunk
export const getUsers = createAdminThunkWithArg('getUsers', adminService.getUsers);
export const approveUser = createAdminThunkWithArg('approveUser', adminService.approveUser);
export const deleteUser = createAdminThunkWithArg('deleteUser', adminService.deleteUser);
export const createSchool = createAdminThunkWithArg('createSchool', adminService.createSchool);
export const deleteSchool = createAdminThunkWithArg('deleteSchool', adminService.deleteSchool);
export const assignUserToSchool = createAdminThunkWithArg('assignUserToSchool', adminService.assignUserToSchool);

export const getStats = createAdminThunkWithoutArg('getStats', adminService.getStats);
export const getSchools = createAdminThunkWithoutArg('getSchools', adminService.getSchools);


export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => { state.isLoading = true; })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) { state.users[index] = action.payload; }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schools = action.payload;
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schools.push(action.payload.school);
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schools = state.schools.filter((school) => school._id !== action.payload);
      })
      .addCase(assignUserToSchool.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) { state.users[index] = action.payload; }
      })
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/pending'),
        (state) => { state.isLoading = true; }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;