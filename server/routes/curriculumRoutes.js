const express = require('express');
const router = express.Router();

const {
  createClass,
  createSubject,
  createStrand,
  createSubStrand,
  autoFillSubStrand,
  getCurriculum,
} = require('../controllers/curriculumController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ==============================
// Curriculum Creation & AI Expansion
// ==============================
router.post('/classes', protect, authorize('admin', 'school_admin'), createClass);
router.post('/subjects', protect, authorize('admin', 'school_admin'), createSubject);
router.post('/strands', protect, authorize('admin', 'school_admin', 'teacher'), createStrand);
router.post('/sub-strands', protect, authorize('admin', 'school_admin', 'teacher'), createSubStrand);

// AI: Autofill details for a Sub-Strand
router.post('/sub-strands/:id/autofill', protect, authorize('admin', 'school_admin', 'teacher'), autoFillSubStrand);

// ==============================
// Generic fetcher
// /api/curriculum/:type -> classes | subjects | strands | subStrands
// ==============================
router.get('/:type', protect, authorize('admin', 'school_admin', 'teacher'), getCurriculum);

module.exports = router;
