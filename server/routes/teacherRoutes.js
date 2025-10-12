const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
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

const generateNoteValidator = [
    check('subStrandId', 'A valid Sub-Strand ID is required').isMongoId(),
    check('objectives', 'Learning objectives are required').not().isEmpty().trim().escape(),
    check('aids', 'Teaching aids are required').not().isEmpty().trim().escape(),
    check('duration', 'Lesson duration is required').not().isEmpty().trim().escape(),
];

const createQuizValidator = [
    check('title', 'Quiz title is required').not().isEmpty().trim().escape(),
    check('subjectId', 'A valid Subject ID is required').isMongoId(),
];

router.get('/analytics', getTeacherAnalytics);
router.get('/lessonnotes', getMyLessonNotes);
router.get('/notes/:id', [check('id').isMongoId()], handleValidationErrors, getLessonNoteById);
router.post('/generate-note', generateNoteValidator, handleValidationErrors, generateLessonNote);
router.post('/generate-learner-note', [check('lessonNoteId', 'A valid Lesson Note ID is required').isMongoId()], handleValidationErrors, generateLearnerNote);
router.post('/create-quiz', createQuizValidator, handleValidationErrors, createQuiz);
router.post('/upload-resource', upload, [check('subStrandId', 'A valid Sub-Strand ID is required').isMongoId()], handleValidationErrors, uploadResource);

module.exports = router;