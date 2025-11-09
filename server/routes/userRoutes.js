const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  getPendingUsers,    // ✅ NEW
  approveUser,        // ✅ NEW
  suspendUser,        // ✅ NEW
  rejectUser,         // ✅ NEW
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Login user and get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getAllUsers);

// ✅ NEW APPROVAL ROUTES
// @route   GET /api/users/pending
// @desc    Get all pending users (Admin only)
// @access  Private/Admin
router.get('/pending', protect, authorize('admin'), getPendingUsers);

// @route   PATCH /api/users/approve/:id
// @desc    Approve a pending user (Admin only)
// @access  Private/Admin
router.patch('/approve/:id', protect, authorize('admin'), approveUser);

// @route   PATCH /api/users/suspend/:id
// @desc    Suspend a user (Admin only)
// @access  Private/Admin
router.patch('/suspend/:id', protect, authorize('admin'), suspendUser);

// @route   DELETE /api/users/reject/:id
// @desc    Reject and delete a pending user (Admin only)
// @access  Private/Admin
router.delete('/reject/:id', protect, authorize('admin'), rejectUser);

// @route   GET /api/users/profile
// @desc    Get logged-in user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update logged-in user profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   DELETE /api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;