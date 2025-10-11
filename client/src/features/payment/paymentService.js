// src/features/payment/paymentService.js (Revised)

import api from '../../api/axios'; // <-- Import our new centralized instance

/**
 * Initialize a payment transaction with Paystack.
 * The auth token for the logged-in user is added automatically by the axios interceptor.
 * @param {object} paymentData - Contains email, amount, and plan.
 * @returns {Promise<object>} The data from the Paystack API response.
 */
const initializePayment = async (paymentData) => {
  const response = await api.post('/payments/initialize', paymentData);
  // The service layer just returns the data; the slice will handle state updates.
  return response.data;
};

const paymentService = {
  initializePayment,
};

export default paymentService;