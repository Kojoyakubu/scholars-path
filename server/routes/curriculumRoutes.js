// /server/routes/curriculumRoutes.js
const express = require('express');
const router = express.Router();

const {
  createLevel,
  createClass,
  createSubject,
  createStrand,
  createSubStrand,
  getCurriculum,
  getChildren,
  updateCurriculum,
  deleteCurriculum,
  autoFillSubStrand,
} = require('../controllers/curriculumController');

const { protect, authorize } = require('../middleware/authMiddleware');

/* ============================================================================
 * CREATE ROUTES
 * ============================================================================
 */
router.post('/levels', protect, authorize('admin', 'school_admin'), createLevel);
router.post('/classes', protect, authorize('admin', 'school_admin'), createClass);
router.post('/subjects', protect, authorize('admin', 'school_admin'), createSubject);
router.post('/strands', protect, authorize('admin', 'school_admin', 'teacher'), createStrand);
router.post('/sub-strands', protect, authorize('admin', 'school_admin', 'teacher'), createSubStrand);
router.post('/subStrands', protect, authorize('admin', 'school_admin', 'teacher'), createSubStrand);

/* ============================================================================
 * READ ROUTES
 * ============================================================================
 */
// Get all items of a type
router.get('/:type', protect, getCurriculum);

// Get children of a specific parent
router.get('/:parentType/:parentId/:childType', protect, getChildren);

/* ============================================================================
 * UPDATE ROUTES
 * ============================================================================
 */
router.put('/:type/:id', protect, authorize('admin', 'school_admin'), updateCurriculum);

/* ============================================================================
 * DELETE ROUTES
 * ============================================================================
 */
router.delete('/:type/:id', protect, authorize('admin', 'school_admin'), deleteCurriculum);

/* ============================================================================
 * AI ROUTES
 * ============================================================================
 */
router.post('/sub-strands/:id/autofill', protect, authorize('admin', 'school_admin', 'teacher'), autoFillSubStrand);
router.post('/subStrands/:id/autofill', protect, authorize('admin', 'school_admin', 'teacher'), autoFillSubStrand);

module.exports = router;