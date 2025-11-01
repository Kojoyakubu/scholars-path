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
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming you have this middleware

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- PROTECTED ROUTES ---
// We add the 'protect' and 'admin' middleware here for security
router.get('/', protect, admin, getAllUsers);

router
  .route('/:id')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, admin, deleteUser);

// ✅ THE FIX: Delete the entire line that uses the non-existent function
// router.get('/:id/summary', getUserSummary); // <-- DELETE THIS LINE

module.exports = router;