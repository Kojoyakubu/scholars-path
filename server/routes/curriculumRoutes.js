const express = require('express');
const router = express.Router();
const { 
  createLevel, getLevels, updateLevel, deleteLevel,
  createClass, getClasses, updateClass, deleteClass,
  createSubject, getSubjects, updateSubject, deleteSubject,
  createStrand, getStrands, updateStrand, deleteStrand,
  createSubStrand, getSubStrands, updateSubStrand, deleteSubStrand
} = require('../controllers/curriculumController');
const { protect, admin } = require('../middleware/authMiddleware');

// Level routes
router.route('/levels').post(protect, admin, createLevel).get(getLevels);
router.route('/levels/:id').put(protect, admin, updateLevel).delete(protect, admin, deleteLevel);

// Class routes
router.route('/classes').post(protect, admin, createClass).get(getClasses);
router.route('/classes/:id').put(protect, admin, updateClass).delete(protect, admin, deleteClass);

// Subject routes
router.route('/subjects').post(protect, admin, createSubject).get(getSubjects);
router.route('/subjects/:id').put(protect, admin, updateSubject).delete(protect, admin, deleteSubject);

// Strand routes
router.route('/strands').post(protect, admin, createStrand).get(getStrands);
router.route('/strands/:id').put(protect, admin, updateStrand).delete(protect, admin, deleteStrand);

// Sub-strand routes
router.route('/substrands').post(protect, admin, createSubStrand).get(getSubStrands);
router.route('/substrands/:id').put(protect, admin, updateSubStrand).delete(protect, admin, deleteSubStrand);

module.exports = router;