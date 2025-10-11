// src/features/payment/paymentSlice.js (Revised)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from './paymentService';

const initialState = {
  authorization_url: null, // Holds the redirect URL from Paystack
  isSuccess: false,
  isLoading: false,
  isError: false,
  message: '',
};

// --- Async Thunk (Simplified) ---
// The thunk is now cleaner as it doesn't need to access state for the token.
export const initializePayment = createAsyncThunk(
  'payment/initialize',
  async (paymentData, thunkAPI) => {
    try {
      return await paymentService.initializePayment(paymentData);
    } catch (error) {
      const message = (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Payment Slice ---
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Resets the state, useful for clearing the URL after redirection
    resetPaymentState: (state) => {
      state.authorization_url = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializePayment.fulfilled, (state, action) => {
        // The service returns the payload from the backend proxy
        if (action.payload.status) {
          state.authorization_url = action.payload.data.authorization_url;
          state.isSuccess = true;
        } else {
          // Handle cases where the Paystack API itself returns an error
          state.isError = true;
          state.message = action.payload.message || 'Payment initialization failed.';
        }
      })

      // Use addMatcher for generic pending/rejected/fulfilled cases to reduce boilerplate
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        }
      );
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;