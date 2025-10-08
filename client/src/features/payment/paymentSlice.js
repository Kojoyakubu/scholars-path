import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/payments/';

export const initializePayment = createAsyncThunk('payment/initialize', async (paymentData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'initialize', paymentData, config);
    // If successful, redirect the user to the Paystack checkout page
    if (response.data.status) {
      window.location.href = response.data.data.authorization_url;
    }
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializePayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializePayment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default paymentSlice.reducer;