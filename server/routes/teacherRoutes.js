const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  deleteLessonNote,
  generateLearnerNote,
  createQuiz,
  uploadResource,
  getTeacherAnalytics,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.use(protect, authorize('teacher', 'school_admin', 'admin'));

// --- Validators (no changes here) ---
const generateNoteValidator = [
    check('subStrandId', 'A valid Sub-Strand ID is required').isMongoId(),
    check('school', 'School name is required').not().isEmpty().trim().escape(),
    check('term', 'Term is required').not().isEmpty().trim().escape(),
    check('duration', 'Duration is required').not().isEmpty().trim().escape(),
    check('dayDate', 'Day/Date is required').not().isEmpty().trim().escape(),
    check('performanceIndicator', 'Performance Indicator is required').not().isEmpty().trim().escape(),
];

const createQuizValidator = [
    check('title', 'Quiz title is required').not().isEmpty().trim().escape(),
    check('subjectId', 'A valid Subject ID is required').isMongoId(),
];


// --- ✅ CORRECTED ROUTE ORDER ---

// 1. Static routes come first.
router.get('/analytics', getTeacherAnalytics);
router.get('/lessonnotes', getMyLessonNotes); // This specific route is now listed before any dynamic ':id' routes.

// 2. Dynamic routes with parameters come after.
router.get('/notes/:id', [check('id').isMongoId()], handleValidationErrors, getLessonNoteById);
router.delete('/notes/:id', [check('id').isMongoId()], handleValidationErrors, deleteLessonNote);

// 3. POST routes
router.post('/generate-note', generateNoteValidator, handleValidationErrors, generateLessonNote);
router.post('/generate-learner-note', [check('lessonNoteId', 'A valid Lesson Note ID is required').isMongoId()], handleValidationErrors, generateLearnerNote);
router.post('/create-quiz', createQuizValidator, handleValidationErrors, createQuiz);
router.post('/upload-resource', upload, [check('subStrandId', 'A valid Sub-Strand ID is required').isMongoId()], handleValidationErrors, uploadResource);


module.exports = router;