const express = require('express');
const router = express.Router();

// ✅ THE FIX: Remove getUserSummary from the import list
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming you have middleware for protection

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- PROTECTED ROUTES ---
// We add middleware here for security.
// 'protect' ensures a user is logged in. 'admin' ensures the user is an admin.
router.get('/', protect, admin, getAllUsers);

router
  .route('/:id')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, admin, deleteUser);

// ✅ THE FIX: The route that caused the crash has been deleted.
// router.get('/:id/summary', getUserSummary); // <-- This line is gone.

module.exports = router;