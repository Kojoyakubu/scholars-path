const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
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

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Protect all routes in this file with Admin authorization
router.use(protect, authorize('admin'));

// Validation Chains
const mongoIdValidator = (fieldName) => check(fieldName, 'Invalid ID format').isMongoId();

const createSchoolValidator = [
  check('name', 'School name is required').not().isEmpty().trim().escape(),
  check('adminName', 'Admin name is required').not().isEmpty().trim().escape(),
  check('adminEmail', 'A valid admin email is required').isEmail().normalizeEmail(),
  check('adminPassword', 'Admin password must be at least 6 characters').isLength({ min: 6 }),
];

const assignSchoolValidator = [
    mongoIdValidator('id'),
    check('schoolId', 'A valid school ID is required').isMongoId(),
];

// User management routes
router.get('/users', getUsers);
router.put('/users/:id/approve', mongoIdValidator('id'), handleValidationErrors, approveUser);
router.delete('/users/:id', mongoIdValidator('id'), handleValidationErrors, deleteUser);
router.put('/users/:id/assign-school', assignSchoolValidator, handleValidationErrors, assignUserToSchool);

// Stats routes
router.get('/stats', getUsageStats);

// School management routes
router.post('/schools', createSchoolValidator, handleValidationErrors, createSchool);
router.get('/schools', getSchools);
router.delete('/schools/:id', mongoIdValidator('id'), handleValidationErrors, deleteSchool);

module.exports = router;