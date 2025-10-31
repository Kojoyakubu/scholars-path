// /server/routes/teacherRoutes.js
const express = require('express');
const router = express.Router();

const {
  generateLessonNote,
  getMyLessonNotes,
  getLessonNoteById,
  deleteLessonNote,
  generateLearnerNote,
  createQuiz,
  uploadResource,
  getTeacherAnalytics,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote,
  searchImage,
} = require('../controllers/teacherController');

const { protect, authorize } = require('../middleware/authMiddleware');

// --- Lesson Notes ---
router.post('/ai/generate-note', protect, authorize('teacher'), generateLessonNote);
router.get('/lesson-notes', protect, authorize('teacher'), getMyLessonNotes);
router.get('/lesson-notes/:id', protect, authorize('teacher', 'admin', 'school_admin'), getLessonNoteById);
router.delete('/lesson-notes/:id', protect, authorize('teacher'), deleteLessonNote);

// --- Learner Notes ---
router.post('/ai/generate-learner-note', protect, authorize('teacher'), generateLearnerNote);
router.get('/learner-notes/drafts', protect, authorize('teacher'), getDraftLearnerNotes);
router.put('/learner-notes/:id/publish', protect, authorize('teacher'), publishLearnerNote);
router.delete('/learner-notes/:id', protect, authorize('teacher'), deleteLearnerNote);

// --- Quizzes ---
router.post('/quizzes', protect, authorize('teacher'), createQuiz);

// --- Resources ---
router.post('/resources/upload', protect, authorize('teacher'), uploadResource);

// --- Analytics ---
router.get('/analytics', protect, authorize('teacher'), getTeacherAnalytics);

// ✅ NEW ALIASES — these fix your 404s
router.get('/insights', protect, authorize('teacher'), getTeacherAnalytics);
router.get('/dashboard', protect, authorize('teacher'), getTeacherAnalytics);

// --- Utility ---
router.get('/search-image', protect, authorize('teacher'), searchImage);

module.exports = router;
