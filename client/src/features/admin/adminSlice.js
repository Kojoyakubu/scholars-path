// src/features/admin/adminSlice.js (Revised)

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
  message: '',
};

// --- Async Thunks (Simplified) ---
// No more token logic needed here!

export const getUsers = createAsyncThunk('admin/getUsers', adminService.getUsers);
export const approveUser = createAsyncThunk('admin/approveUser', adminService.approveUser);
export const deleteUser = createAsyncThunk('admin/deleteUser', adminService.deleteUser);
export const createSchool = createAsyncThunk('admin/createSchool', adminService.createSchool);
export const deleteSchool = createAsyncThunk('admin/deleteSchool', adminService.deleteSchool);
export const assignUserToSchool = createAsyncThunk('admin/assignUserToSchool', adminService.assignUserToSchool);
export const getStats = createAsyncThunk('admin/getStats', adminService.getStats);
export const getSchools = createAsyncThunk('admin/getSchools', adminService.getSchools);


// --- Admin Slice ---
export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      
      // approveUser & assignUserToSchool (they do the same thing: update a user)
      .addCase(approveUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map(user => 
            user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(assignUserToSchool.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map(user => 
            user._id === action.payload._id ? action.payload : user
        );
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      
      // getStats
      .addCase(getStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      
      // getSchools
      .addCase(getSchools.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schools = action.payload;
      })
      
      // createSchool
      .addCase(createSchool.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schools.push(action.payload.school);
      })
      
      // deleteSchool
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schools = state.schools.filter((school) => school._id !== action.payload);
      })

      // Use addMatcher for generic pending/rejected cases to reduce boilerplate
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          const message = action.payload || (action.error ? action.error.message : 'An unknown error occurred');
          state.message = message;
        }
      );
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;