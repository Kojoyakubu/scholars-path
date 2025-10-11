const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
  getMyLessonNotes,
  generateLessonNote,
  generateLearnerNote,
  createQuiz,
  generateAiQuestion,
  uploadResource,
  generateAiQuizSection,
  getTeacherAnalytics,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Protect all routes with Teacher (or higher) authorization
router.use(protect, authorize('teacher', 'school_admin', 'admin')); // Note: Subscription check is commented out as per original file

// Validation Chains
const mongoIdValidator = (fieldName) => check(fieldName, 'Invalid ID format').isMongoId();

const generateNoteValidator = [
    mongoIdValidator('subStrandId'),
    check('objectives', 'Learning objectives are required').not().isEmpty().trim().escape(),
    check('aids', 'Teaching aids are required').not().isEmpty().trim().escape(),
    check('duration', 'Duration is required').not().isEmpty().trim().escape(),
];

const createQuizValidator = [
    check('title', 'Quiz title is required').not().isEmpty().trim().escape(),
    mongoIdValidator('subjectId'),
];

const uploadResourceValidator = [
    mongoIdValidator('subStrandId'),
];

// Route Definitions
router.get('/lessonnotes', getMyLessonNotes);
router.get('/analytics', getTeacherAnalytics);

router.post('/generate-note', generateNoteValidator, handleValidationErrors, generateLessonNote);
router.post('/generate-learner-note', [mongoIdValidator('lessonNoteId')], handleValidationErrors, generateLearnerNote);
router.post('/create-quiz', createQuizValidator, handleValidationErrors, createQuiz);
router.post('/generate-ai-question', generateAiQuestion); // Add validation if implemented
router.post('/generate-ai-quiz-section', generateAiQuizSection); // Add validation if implemented
router.post('/upload-resource', upload, uploadResourceValidator, handleValidationErrors, uploadResource);

module.exports = router;