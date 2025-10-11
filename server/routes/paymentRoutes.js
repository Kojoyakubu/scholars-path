const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation Chains
const initializePaymentValidator = [
    check('email', 'A valid email is required').isEmail(),
    check('amount', 'Amount must be a numeric value').isNumeric(),
    check('plan', 'Subscription plan is required').isIn(['monthly', 'yearly']),
];

const verifyPaymentValidator = [
    check('reference', 'Payment reference is required').not().isEmpty().trim().escape(),
];

// Route Definitions
router.post('/initialize', protect, initializePaymentValidator, handleValidationErrors, initializePayment);
// The verify route is a callback from Paystack, so it doesn't need 'protect' middleware
router.get('/verify/:reference', verifyPaymentValidator, handleValidationErrors, verifyPayment);

module.exports = router;