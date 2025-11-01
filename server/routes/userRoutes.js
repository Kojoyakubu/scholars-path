const express = require('express');
const router = express.Router();

// ✅ FIX: Remove getUserSummary from the import list
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware'); // For security

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- PROTECTED ROUTES ---
// 'protect' ensures a user is logged in. 'admin' ensures they are an admin.
router.get('/', protect, admin, getAllUsers);

router
  .route('/:id')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, admin, deleteUser);

// ✅ FIX: The route that caused the server to crash has been deleted.
// router.get('/:id/summary', getUserSummary); // <-- This line must be removed.

module.exports = router;