const express = require('express');
const router = express.Router();

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

// ==============================
// Student: Content Access
// ==============================
router.get('/notes/:subStrandId', protect, authorize('student'), getLearnerNotes);
router.get('/quizzes/:subStrandId', protect, authorize('student'), getQuizzes);
router.get('/resources/:subStrandId', protect, authorize('student'), getResources);

// ==============================
// Student: Quiz Flow
// ==============================
router.get('/quiz/:id', protect, authorize('student'), getQuizDetails);
router.post('/quiz/:id/submit', protect, authorize('student'), submitQuiz);

// ==============================
// Student: Badges & Engagement
// ==============================
router.get('/badges', protect, authorize('student'), getMyBadges);
router.post('/notes/:id/view', protect, authorize('student'), logNoteView);

module.exports = router;
