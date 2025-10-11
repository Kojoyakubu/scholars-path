const express = require('express');
const router = express.Router();
const { check, body, validationResult } = require('express-validator');
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

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Protect all routes with Student (or admin) authorization
router.use(protect, authorize('student', 'admin'));

// Validation Chains
const mongoIdParamValidator = (paramName) => check(paramName, 'Invalid URL parameter').isMongoId();

const submitQuizValidator = [
    mongoIdParamValidator('id'),
    body('answers', 'Answers must be an array').isArray(),
    body('answers.*.questionId', 'Each answer must have a valid question ID').isMongoId(),
    body('answers.*.selectedOptionId', 'Each answer must have a valid selected option ID').isMongoId(),
];

// Route Definitions
router.get('/notes/:subStrandId', mongoIdParamValidator('subStrandId'), handleValidationErrors, getLearnerNotes);
router.get('/quizzes/:subStrandId', mongoIdParamValidator('subStrandId'), handleValidationErrors, getQuizzes);
router.get('/resources/:subStrandId', mongoIdParamValidator('subStrandId'), handleValidationErrors, getResources);
router.get('/quiz/:id', mongoIdParamValidator('id'), handleValidationErrors, getQuizDetails);
router.get('/my-badges', getMyBadges);

router.post('/quiz/:id/submit', submitQuizValidator, handleValidationErrors, submitQuiz);
router.post('/notes/:id/view', mongoIdParamValidator('id'), handleValidationErrors, logNoteView);

module.exports = router;