// server/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const {
  getLearnerNotes,
  getQuizzes,
  getResources,
  getQuizDetails,
  submitQuiz,
  getMyBadges,
  logNoteView,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware'); // <-- IMPORT

// Protect all routes with Student authorization (admins can also access)
router.use(protect, authorize('student', 'admin'));

// --- Reusable Validation Chains ---
const mongoIdParam = (paramName) => param(paramName, `Invalid ID format in URL for '${paramName}'`).isMongoId();

const submitQuizValidator = [
  mongoIdParam('id'),
  body('answers', 'Answers must be an array').isArray({ min: 1 }), // Ensure answers array is not empty
  body('answers.*.questionId', 'Each answer must have a valid question ID').isMongoId(),
  body('answers.*.selectedOptionId', 'Each answer must have a valid selected option ID').isMongoId(),
];

// --- Route Definitions ---
router.get('/notes/:subStrandId', mongoIdParam('subStrandId'), handleValidationErrors, getLearnerNotes);
router.get('/quizzes/:subStrandId', mongoIdParam('subStrandId'), handleValidationErrors, getQuizzes);
router.get('/resources/:subStrandId', mongoIdParam('subStrandId'), handleValidationErrors, getResources);
router.get('/quiz/:id', mongoIdParam('id'), handleValidationErrors, getQuizDetails);
router.get('/my-badges', getMyBadges);

router.post('/quiz/:id/submit', submitQuizValidator, handleValidationErrors, submitQuiz);
router.post('/notes/:id/view', mongoIdParam('id'), handleValidationErrors, logNoteView);

module.exports = router;