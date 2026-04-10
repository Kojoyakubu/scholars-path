const express = require('express');
const router = express.Router();

const {
  createPayment,
  getDownloadPricing,
  chargeDownload,
  initializeDownloadPayment,
  verifyDownloadPayment,
  getAllPayments,
  getUserPayments,
  getPaymentSummary,
  deletePayment,
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ==============================
// Payments & Summaries
// ==============================
router.get('/download-pricing', protect, authorize('teacher', 'admin', 'school_admin'), getDownloadPricing);
router.post('/downloads/charge', protect, authorize('teacher'), chargeDownload);
router.post('/downloads/initialize', protect, authorize('teacher'), initializeDownloadPayment);
router.post('/downloads/verify', protect, authorize('teacher'), verifyDownloadPayment);
router.post('/', protect, authorize('admin', 'school_admin'), createPayment);
router.get('/', protect, authorize('admin', 'school_admin'), getAllPayments);
router.get('/user/:id', protect, authorize('admin', 'school_admin'), getUserPayments);
router.get('/:id/summary', protect, authorize('admin', 'school_admin', 'teacher'), getPaymentSummary);
router.delete('/:id', protect, authorize('admin'), deletePayment);

module.exports = router;
