// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware'); // <-- IMPORT

// --- Validation Chains ---
const registerValidation = [
  check('fullName', 'Full name is required').not().isEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
];

// --- Route Definitions ---
router.post('/register', registerValidation, handleValidationErrors, registerUser);
router.post('/login', loginValidation, handleValidationErrors, loginUser);
router.get('/profile', protect, getUserProfile); // No validation needed here

module.exports = router;