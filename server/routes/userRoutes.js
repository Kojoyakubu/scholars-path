const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  getUserSummary,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');

// ================================
// 📂 PUBLIC ROUTES (no token needed)
// ================================
router.post('/register', registerUser); // Create new user
router.post('/login', loginUser);       // Authenticate user (Login)

// ================================
// 🔒 PROTECTED / ADMIN ROUTES
// ================================
// (You can add authentication middleware later if needed)
router.get('/', getAllUsers);            // Get all users (Admin)
router.get('/:id', getUserProfile);      // Get specific user
router.get('/:id/summary', getUserSummary); // Get user dashboard summary
router.put('/:id', updateUserProfile);   // Update user
router.delete('/:id', deleteUser);       // Delete user

module.exports = router;
