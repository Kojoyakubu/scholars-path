import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

const initialState = {
  users: [],
  pages: 1, // For pagination
  page: 1,  // For pagination
  stats: {},
  schools: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Generic thunk creator for admin actions
const createAdminThunk = (name, serviceCall) => {
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

export const getUsers = createAdminThunk('getUsers', adminService.getUsers);
export const approveUser = createAdminThunk('approveUser', adminService.approveUser);
export const deleteUser = createAdminThunk('deleteUser', adminService.deleteUser);
export const getStats = createAdminThunk('getStats', adminService.getStats);
export const getSchools = createAdminThunk('getSchools', adminService.getSchools);
export const createSchool = createAdminThunk('createSchool', adminService.createSchool);
export const deleteSchool = createAdminThunk('deleteSchool', adminService.deleteSchool);
export const assignUserToSchool = createAdminThunk('assignUserToSchool', adminService.assignUserToSchool);

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
      // getUsers with pagination
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
      // approveUser (renamed from approveTeacher for clarity)
      .addCase(approveUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) { state.users[index] = action.payload; }
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
      // assignUserToSchool
      .addCase(assignUserToSchool.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) { state.users[index] = action.payload; }
      })
      // Generic pending/rejected for other actions to reduce boilerplate
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
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/fulfilled'),
        (state) => { state.isLoading = false; }
      );
  },
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;