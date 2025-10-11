const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { getSchoolDashboard } = require('../controllers/schoolController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const mongoIdParamValidator = (paramName) => check(paramName, 'Invalid School ID parameter').isMongoId();

router.get('/dashboard/:schoolId', protect, mongoIdParamValidator('schoolId'), handleValidationErrors, getSchoolDashboard);

module.exports = router;