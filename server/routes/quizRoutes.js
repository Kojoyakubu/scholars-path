const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validatorMiddleware');

// ✅ THE FIX IS HERE: Ensure all required functions are imported.
const {
  createQuiz,
  getTeacherQuizzes,
  getQuizForEditing,
  addQuestionToQuiz,
  deleteQuiz,
  generateAiQuiz, // This was likely missing from your import list
} = require('../controllers/quizController');

// Protect all routes in this file
router.use(protect, authorize('teacher', 'school_admin', 'admin'));

// --- Validation Chains ---
const mongoIdParam = (name) => param(name, `Invalid ID format for '${name}'`).isMongoId();

const createQuizValidator = [
  body('title', 'Quiz title is required').not().isEmpty().trim(),
  body('subjectId', 'A valid Subject ID is required').isMongoId(),
];

const addQuestionValidator = [
  mongoIdParam('quizId'),
  body('text', 'Question text is required').not().isEmpty().trim(),
  body('options', 'At least two options are required').isArray({ min: 2 }),
  body('options.*.text', 'Each option must have text').not().isEmpty().trim(),
  body('options.*.isCorrect', 'Each option must specify if it is correct').isBoolean(),
];

const generateAiQuizValidator = [
  body('title', 'Quiz title is required').not().isEmpty().trim(),
  body('subjectId', 'A valid Subject ID is required').isMongoId(),
  body('numQuestions', 'Number of questions must be a number between 3 and 20').isInt({ min: 3, max: 20 }),
];

// --- Route Definitions ---

// Base route for getting all quizzes or creating a new one
router.route('/')
  .get(getTeacherQuizzes)
  .post(createQuizValidator, handleValidationErrors, createQuiz);

// Route for AI quiz generation
router.post('/generate-ai', generateAiQuizValidator, handleValidationErrors, generateAiQuiz);

// Route for a specific quiz
router.route('/:quizId')
  .get(mongoIdParam('quizId'), handleValidationErrors, getQuizForEditing)
  .delete(mongoIdParam('quizId'), handleValidationErrors, deleteQuiz);

// Route to add questions to a specific quiz
router.post(
  '/:quizId/questions',
  addQuestionValidator,
  handleValidationErrors,
  addQuestionToQuiz
);

module.exports = router;