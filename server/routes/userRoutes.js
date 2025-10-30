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

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private/Admin routes
router.get('/', getAllUsers);
router.get('/:id', getUserProfile);
router.get('/:id/summary', getUserSummary);
router.put('/:id', updateUserProfile);
router.delete('/:id', deleteUser);

module.exports = router;
