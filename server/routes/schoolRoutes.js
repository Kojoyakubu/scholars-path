const express = require('express');
const router = express.Router();

const {
  createSchool,
  getAllSchools,
  getSchoolDetails,
  updateSchool,
  deleteSchool,
} = require('../controllers/schoolController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ==============================
// School Management
// ==============================
router.post('/', protect, authorize('admin'), createSchool);
router.get('/', protect, authorize('admin', 'school_admin'), getAllSchools);
router.get('/:id', protect, authorize('admin', 'school_admin', 'teacher'), getSchoolDetails);
router.put('/:id', protect, authorize('admin'), updateSchool);
router.delete('/:id', protect, authorize('admin'), deleteSchool);

module.exports = router;
