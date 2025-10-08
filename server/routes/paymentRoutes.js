const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', verifyPayment); // Paystack callback doesn't need 'protect'

module.exports = router;