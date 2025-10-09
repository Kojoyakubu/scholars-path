import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from './paymentService';

const initialState = {
  authorization_url: null, // To hold the redirect URL
  isLoading: false,
  isError: false,
  message: '',
};

export const initializePayment = createAsyncThunk('payment/initialize', async (paymentData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    // The service now returns the data, not a redirect
    return await paymentService.initializePayment(paymentData, token);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPayment: (state) => {
        state.authorization_url = null;
        state.isLoading = false;
        state.isError = false;
        state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializePayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store the URL in the state; the UI component will handle the redirect
        if (action.payload.status) {
            state.authorization_url = action.payload.data.authorization_url;
        }
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;