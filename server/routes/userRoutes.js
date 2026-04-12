const express = require('express');
const router = express.Router();
const {
  registerUser,
  googleAuth,
  socialAuth,
  socialAuthExchange,
  verifyEmail,
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  logoutUser,
  enable2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
  getAllUsers,
  getPendingUsers,
  approveUser,
  suspendUser,
  rejectUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware');
const {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
  validateProfileUpdate
} = require('../middleware/userValidation');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, handleValidationErrors, registerUser);

// @route   POST /api/users/google-auth
// @desc    Authenticate/register with Google
// @access  Public
router.post('/google-auth', googleAuth);

// @route   POST /api/users/social-auth
// @desc    Authenticate/register with supported social providers
// @access  Public
router.post('/social-auth', socialAuth);

// @route   POST /api/users/social-auth/exchange
// @desc    Exchange OAuth code for token and authenticate/register
// @access  Public
router.post('/social-auth/exchange', socialAuthExchange);

// @route   POST /api/users/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', verifyEmail);

// @route   POST /api/users/login
// @desc    Login user and get token
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, loginUser);

// @route   POST /api/users/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', refreshToken);

// @route   POST /api/users/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', validatePasswordReset, handleValidationErrors, forgotPassword);

// @route   POST /api/users/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', validateNewPassword, handleValidationErrors, resetPassword);

// @route   POST /api/users/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logoutUser);

// @route   POST /api/users/enable-2fa
// @desc    Enable 2FA for user
// @access  Private
router.post('/enable-2fa', protect, enable2FA);

// @route   POST /api/users/verify-2fa
// @desc    Verify and enable 2FA
// @access  Private
router.post('/verify-2fa', protect, verify2FA);

// @route   POST /api/users/disable-2fa
// @desc    Disable 2FA
// @access  Private
router.post('/disable-2fa', protect, disable2FA);

// @route   POST /api/users/verify-2fa-login
// @desc    Verify 2FA token during login
// @access  Public
router.post('/verify-2fa-login', verify2FALogin);

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
router.put('/profile', protect, validateProfileUpdate, handleValidationErrors, updateUserProfile);

// @route   DELETE /api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;