// routes/userRoutes.js (Revised)

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to handle validation errors from express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation chains for user routes
const registerValidation = [
  check('fullName', 'Full name is required').not().isEmpty().trim().escape(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
];


// --- Route Definitions ---

// @route   POST /api/users/register
router.post('/register', registerValidation, handleValidationErrors, registerUser);

// @route   POST /api/users/login
router.post('/login', loginValidation, handleValidationErrors, loginUser);

// @route   GET /api/users/profile
router.get('/profile', protect, getUserProfile);

module.exports = router;