const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
  // Dynamic Getters
  getClassesByLevel,
  getSubjectsByClass,
  getStrandsBySubject,
  getSubStrandsByStrand,
  // CRUD
  createLevel, getLevels, updateLevel, deleteLevel,
  createClass, getClasses, updateClass, deleteClass,
  createSubject, getSubjects, updateSubject, deleteSubject,
  createStrand, getStrands, updateStrand, deleteStrand,
  createSubStrand, getSubStrands, updateSubStrand, deleteSubStrand,
} = require('../controllers/curriculumController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation Chains
const mongoIdParamValidator = (paramName) => check(paramName, `Invalid Mongo ID in parameter: ${paramName}`).isMongoId();
const nameValidator = check('name', 'Name is required').not().isEmpty().trim().escape();
const levelFkValidator = check('level', 'A valid level ID is required').isMongoId();
const classFkValidator = check('class', 'A valid class ID is required').isMongoId();
const subjectFkValidator = check('subject', 'A valid subject ID is required').isMongoId();
const strandFkValidator = check('strand', 'A valid strand ID is required').isMongoId();


// --- DYNAMIC FETCHING ROUTES (Protected for logged-in users) ---
router.get('/levels/:levelId/classes', protect, mongoIdParamValidator('levelId'), handleValidationErrors, getClassesByLevel);
router.get('/classes/:classId/subjects', protect, mongoIdParamValidator('classId'), handleValidationErrors, getSubjectsByClass);
router.get('/subjects/:subjectId/strands', protect, mongoIdParamValidator('subjectId'), handleValidationErrors, getStrandsBySubject);
router.get('/strands/:strandId/substrands', protect, mongoIdParamValidator('strandId'), handleValidationErrors, getSubStrandsByStrand);


// --- ADMIN-ONLY CRUD ROUTES ---

// Level routes
router.route('/levels')
  .post(protect, authorize('admin'), [nameValidator], handleValidationErrors, createLevel)
  .get(getLevels); // Getting curriculum structure can be public or protected
router.route('/levels/:id')
  .put(protect, authorize('admin'), [mongoIdParamValidator('id'), nameValidator], handleValidationErrors, updateLevel)
  .delete(protect, authorize('admin'), [mongoIdParamValidator('id')], handleValidationErrors, deleteLevel);

// Class routes
router.route('/classes')
  .post(protect, authorize('admin'), [nameValidator, levelFkValidator], handleValidationErrors, createClass)
  .get(getClasses);
router.route('/classes/:id')
  .put(protect, authorize('admin'), [mongoIdParamValidator('id'), nameValidator, levelFkValidator], handleValidationErrors, updateClass)
  .delete(protect, authorize('admin'), [mongoIdParamValidator('id')], handleValidationErrors, deleteClass);

// Subject routes
router.route('/subjects')
  .post(protect, authorize('admin'), [nameValidator, classFkValidator], handleValidationErrors, createSubject)
  .get(getSubjects);
router.route('/subjects/:id')
  .put(protect, authorize('admin'), [mongoIdParamValidator('id'), nameValidator, classFkValidator], handleValidationErrors, updateSubject)
  .delete(protect, authorize('admin'), [mongoIdParamValidator('id')], handleValidationErrors, deleteSubject);

// Strand routes
router.route('/strands')
  .post(protect, authorize('admin'), [nameValidator, subjectFkValidator], handleValidationErrors, createStrand)
  .get(getStrands);
router.route('/strands/:id')
  .put(protect, authorize('admin'), [mongoIdParamValidator('id'), nameValidator, subjectFkValidator], handleValidationErrors, updateStrand)
  .delete(protect, authorize('admin'), [mongoIdParamValidator('id')], handleValidationErrors, deleteStrand);

// Sub-strand routes
router.route('/substrands')
  .post(protect, authorize('admin'), [nameValidator, strandFkValidator], handleValidationErrors, createSubStrand)
  .get(getSubStrands);
router.route('/substrands/:id')
  .put(protect, authorize('admin'), [mongoIdParamValidator('id'), nameValidator, strandFkValidator], handleValidationErrors, updateSubStrand)
  .delete(protect, authorize('admin'), [mongoIdParamValidator('id')], handleValidationErrors, deleteSubStrand);

module.exports = router;