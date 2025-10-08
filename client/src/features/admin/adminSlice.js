import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/admin/';

export const getUsers = createAsyncThunk('admin/getUsers', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'users', config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const approveTeacher = createAsyncThunk('admin/approveTeacher', async (userId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + `users/${userId}/approve`, {}, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(API_URL + `users/${userId}`, config);
    return userId;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getStats = createAsyncThunk('admin/getStats', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'stats', config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getSchools = createAsyncThunk('admin/getSchools', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'schools', config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const assignUserToSchool = createAsyncThunk('admin/assignUser', async (data, thunkAPI) => {
  try {
    const { userId, schoolId } = data;
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + `users/${userId}/assign-school`, { schoolId }, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createSchool = createAsyncThunk('admin/createSchool', async (schoolData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'schools', schoolData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteSchool = createAsyncThunk('admin/deleteSchool', async (schoolId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(API_URL + `schools/${schoolId}`, config);
    return schoolId;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    stats: {},
    schools: [],
    isLoading: false,
    isError: false,
    message: '',
  },
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
      .addCase(getUsers.fulfilled, (state, action) => { state.isLoading = false; state.users = action.payload; })
      .addCase(getUsers.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(approveTeacher.pending, (state) => { state.isLoading = true; })
      .addCase(approveTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) { state.users[index] = action.payload; }
      })
      .addCase(approveTeacher.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(deleteUser.pending, (state) => { state.isLoading = true; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(getStats.pending, (state) => { state.isLoading = true; })
      .addCase(getStats.fulfilled, (state, action) => { state.isLoading = false; state.stats = action.payload; })
      .addCase(getStats.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(getSchools.pending, (state) => { state.isLoading = true; })
      .addCase(getSchools.fulfilled, (state, action) => { state.isLoading = false; state.schools = action.payload; })
      .addCase(getSchools.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(assignUserToSchool.pending, (state) => { state.isLoading = true; })
      .addCase(assignUserToSchool.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) { state.users[index] = action.payload; }
      })
      .addCase(assignUserToSchool.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.schools.push(action.payload);
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.schools = state.schools.filter((school) => school._id !== action.payload);
      });
  },
});

export const { reset } = adminSlice.actions;
export default adminSlice.reducer;