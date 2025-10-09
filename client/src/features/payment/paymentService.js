import axios from 'axios';

const API_URL = '/api/payments/';

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Initialize a payment transaction with Paystack
const initializePayment = async (paymentData, token) => {
  const response = await axios.post(API_URL + 'initialize', paymentData, getConfig(token));
  // The thunk will handle the redirect, the service just returns data
  return response.data;
};

const paymentService = {
  initializePayment,
};

export default paymentService;