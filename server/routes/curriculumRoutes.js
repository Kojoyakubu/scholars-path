const express = require('express');
const router = express.Router();
const { 
  createLevel, getLevels, updateLevel, deleteLevel,
  createClass, getClasses, updateClass, deleteClass,
  createSubject, getSubjects, updateSubject, deleteSubject,
  createStrand, getStrands, updateStrand, deleteStrand,
  createSubStrand, getSubStrands, updateSubStrand, deleteSubStrand,
  // Import new controllers
  getClassesByLevel, getSubjectsByClass, getStrandsBySubject, getSubStrandsByStrand
} = require('../controllers/curriculumController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- NEW ROUTES for on-demand fetching ---
router.get('/levels/:levelId/classes', protect, getClassesByLevel);
router.get('/classes/:classId/subjects', protect, getSubjectsByClass);
router.get('/subjects/:subjectId/strands', protect, getStrandsBySubject);
router.get('/strands/:strandId/substrands', protect, getSubStrandsByStrand);


// --- EXISTING ROUTES ---
// Level routes - GET is public, mutations are for admin
router.route('/levels').post(protect, authorize('admin'), createLevel).get(getLevels);
router.route('/levels/:id').put(protect, authorize('admin'), updateLevel).delete(protect, authorize('admin'), deleteLevel);

// Class routes
router.route('/classes').post(protect, authorize('admin'), createClass).get(getClasses);
router.route('/classes/:id').put(protect, authorize('admin'), updateClass).delete(protect, authorize('admin'), deleteClass);

// Subject routes
router.route('/subjects').post(protect, authorize('admin'), createSubject).get(getSubjects);
router.route('/subjects/:id').put(protect, authorize('admin'), updateSubject).delete(protect, authorize('admin'), deleteSubject);

// Strand routes
router.route('/strands').post(protect, authorize('admin'), createStrand).get(getStrands);
router.route('/strands/:id').put(protect, authorize('admin'), updateStrand).delete(protect, authorize('admin'), deleteStrand);

// Sub-strand routes
router.route('/substrands').post(protect, authorize('admin'), createSubStrand).get(getSubStrands);
router.route('/substrands/:id').put(protect, authorize('admin'), updateSubStrand).delete(protect, authorize('admin'), deleteSubStrand);

module.exports = router;