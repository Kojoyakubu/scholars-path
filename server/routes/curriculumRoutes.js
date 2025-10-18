// server/routes/curriculumRoutes.js

const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const controllers = require('../controllers/curriculumController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware'); // <-- IMPORT

// --- Reusable Validation Chains ---
const mongoIdParam = (name) => param(name, `Invalid ID format for '${name}'`).isMongoId();
const nameBody = body('name', 'Name is required').not().isEmpty().trim();
const levelFkBody = body('level', 'A valid level ID is required').isMongoId();
const classFkBody = body('class', 'A valid class ID is required').isMongoId();
const subjectFkBody = body('subject', 'A valid subject ID is required').isMongoId();
const strandFkBody = body('strand', 'A valid strand ID is required').isMongoId();

// Middleware for admin-only routes
const adminOnly = [protect, authorize('admin')];

// --- DYNAMIC FETCHING ROUTES (For any logged-in user) ---
router.get('/levels/:levelId/classes', protect, mongoIdParam('levelId'), handleValidationErrors, controllers.getClassesByLevel);
router.get('/classes/:classId/subjects', protect, mongoIdParam('classId'), handleValidationErrors, controllers.getSubjectsByClass);
router.get('/subjects/:subjectId/strands', protect, mongoIdParam('subjectId'), handleValidationErrors, controllers.getStrandsBySubject);
router.get('/strands/:strandId/substrands', protect, mongoIdParam('strandId'), handleValidationErrors, controllers.getSubStrandsByStrand);

// --- ADMIN-ONLY CRUD ROUTES ---

// Level
router.route('/levels')
  .get(controllers.getLevels)
  .post(...adminOnly, nameBody, handleValidationErrors, controllers.createLevel);
router.route('/levels/:id')
  .put(...adminOnly, mongoIdParam('id'), nameBody, handleValidationErrors, controllers.updateLevel)
  .delete(...adminOnly, mongoIdParam('id'), handleValidationErrors, controllers.deleteLevel);

// Class
router.route('/classes')
  .get(controllers.getClasses)
  .post(...adminOnly, nameBody, levelFkBody, handleValidationErrors, controllers.createClass);
router.route('/classes/:id')
  .put(...adminOnly, mongoIdParam('id'), nameBody, levelFkBody, handleValidationErrors, controllers.updateClass)
  .delete(...adminOnly, mongoIdParam('id'), handleValidationErrors, controllers.deleteClass);

// Subject
router.route('/subjects')
  .get(controllers.getSubjects)
  .post(...adminOnly, nameBody, classFkBody, handleValidationErrors, controllers.createSubject);
router.route('/subjects/:id')
  .put(...adminOnly, mongoIdParam('id'), nameBody, classFkBody, handleValidationErrors, controllers.updateSubject)
  .delete(...adminOnly, mongoIdParam('id'), handleValidationErrors, controllers.deleteSubject);

// Strand
router.route('/strands')
  .get(controllers.getStrands)
  .post(...adminOnly, nameBody, subjectFkBody, handleValidationErrors, controllers.createStrand);
router.route('/strands/:id')
  .put(...adminOnly, mongoIdParam('id'), nameBody, subjectFkBody, handleValidationErrors, controllers.updateStrand)
  .delete(...adminOnly, mongoIdParam('id'), handleValidationErrors, controllers.deleteStrand);

// Sub-strand
router.route('/substrands')
  .get(controllers.getSubStrands)
  .post(...adminOnly, nameBody, strandFkBody, handleValidationErrors, controllers.createSubStrand);
router.route('/substrands/:id')
  .put(...adminOnly, mongoIdParam('id'), nameBody, strandFkBody, handleValidationErrors, controllers.updateSubStrand)
  .delete(...adminOnly, mongoIdParam('id'), handleValidationErrors, controllers.deleteSubStrand);

module.exports = router;