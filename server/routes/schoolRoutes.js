// server/routes/schoolRoutes.js

const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { getSchoolDashboard } = require('../controllers/schoolController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware'); // <-- IMPORT

// --- Validation Chains ---
const mongoIdParamValidator = param('schoolId', 'Invalid School ID format in URL').isMongoId();

// --- Route Definitions ---
// Note: Authorization is handled inside the controller for this specific route
router.get(
  '/dashboard/:schoolId',
  protect,
  mongoIdParamValidator,
  handleValidationErrors,
  getSchoolDashboard
);

module.exports = router;