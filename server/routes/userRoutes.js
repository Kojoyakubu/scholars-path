const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
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
