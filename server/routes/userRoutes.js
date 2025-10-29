const express = require('express');
const router = express.Router();

const {
  registerUser,
  getAllUsers,
  getUserProfile,
  getUserSummary,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ==============================
// Public: Registration
// ==============================
router.post('/register', registerUser);

// ==============================
// Admin: User Management
// ==============================
router.get('/', protect, authorize('admin', 'school_admin'), getAllUsers);
router.get('/:id', protect, authorize('admin', 'school_admin'), getUserProfile);
router.get('/:id/summary', protect, authorize('admin', 'school_admin'), getUserSummary);
router.put('/:id', protect, authorize('admin', 'school_admin'), updateUserProfile);
router.delete('/:id', protect, authorize('admin', 'school_admin'), deleteUser);

module.exports = router;
