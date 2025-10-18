// server/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { initializePayment, handlePaystackWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware'); // <-- IMPORT

// --- Validation Chains ---
const initializePaymentValidator = [
  body('amount', 'Amount must be a numeric value and greater than 0').isFloat({ gt: 0 }),
  body('plan', 'Subscription plan must be either "monthly" or "yearly"').isIn(['monthly', 'yearly']),
];

// --- Route Definitions ---

// User initiates a payment. This is protected.
router.post('/initialize', protect, initializePaymentValidator, handleValidationErrors, initializePayment);

// Paystack sends a POST request to this endpoint after a transaction. This is a public webhook.
// The security is handled inside the controller by verifying the Paystack signature.
router.post('/webhook', handlePaystackWebhook);

module.exports = router;