// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware'); // <-- IMPORT
const {
  getUsers,
  approveUser,
  deleteUser,
  getUsageStats,
  createSchool,
  getSchools,
  deleteSchool,
  assignUserToSchool,
} = require('../controllers/adminController');

// Protect all routes in this file with Admin authorization
router.use(protect, authorize('admin'));

// --- Validation Chains ---
const mongoIdValidator = (paramName) => param(paramName, 'Invalid ID format in URL').isMongoId();

const createSchoolValidator = [
  body('name', 'School name is required').not().isEmpty().trim(),
  body('adminName', 'Admin name is required').not().isEmpty().trim(),
  body('adminEmail', 'A valid admin email is required').isEmail().normalizeEmail(),
  body('adminPassword', 'Admin password must be at least 6 characters').isLength({ min: 6 }),
];

const assignSchoolValidator = [
  mongoIdValidator('id'),
  body('schoolId', 'A valid school ID is required in the request body').isMongoId(),
];

// --- Route Definitions ---
router.get('/users', getUsers);
router.put('/users/:id/approve', mongoIdValidator('id'), handleValidationErrors, approveUser);
router.delete('/users/:id', mongoIdValidator('id'), handleValidationErrors, deleteUser);
router.put('/users/:id/assign-school', assignSchoolValidator, handleValidationErrors, assignUserToSchool);

router.get('/stats', getUsageStats);

router.post('/schools', createSchoolValidator, handleValidationErrors, createSchool);
router.get('/schools', getSchools);
router.delete('/schools/:id', mongoIdValidator('id'), handleValidationErrors, deleteSchool);

module.exports = router;