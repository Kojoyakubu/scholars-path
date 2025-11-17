// /server/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  getCurrentQuiz,
  getQuizInsights,
  getQuizDetails,
  submitQuiz,
  submitAutoGradedQuiz,
  getMyBadges,
  getResources,
  getLearnerNotes,
  getQuizzes,
  logNoteView,
  getQuizAnswers, // ✅ ADDED: New function for answer key
} = require('../controllers/studentController');

// --- Quizzes ---
router.get('/quiz/current', protect, authorize('student'), getCurrentQuiz);
router.get('/quiz/:id', protect, authorize('student'), getQuizDetails);
router.get('/quiz/:id/answers', protect, authorize('student'), getQuizAnswers); // ✅ ADDED: New route for answer key
router.post('/quiz/:id/submit', protect, authorize('student'), submitQuiz);
router.post('/quiz/:id/submit-auto-graded', protect, authorize('student'), submitAutoGradedQuiz);
router.post('/quiz/insights', protect, authorize('student'), getQuizInsights);

// --- Learning Data (FIXED ROUTES) ---
// ✅ THESE ARE THE ROUTES THE FRONTEND IS CALLING
router.get('/notes/:subStrandId', protect, authorize('student'), getLearnerNotes);
router.get('/quizzes/:subStrandId', protect, authorize('student'), getQuizzes);
router.get('/resources/:subStrandId', protect, authorize('student'), getResources);

// --- Badges & Analytics ---
router.get('/badges', protect, authorize('student'), getMyBadges);
router.get('/my-badges', protect, authorize('student'), getMyBadges); // Alias

// --- Note Views ---
router.post('/notes/:id/view', protect, authorize('student'), logNoteView);
router.post('/note-views/:id', protect, authorize('student'), logNoteView); // Alias

module.exports = router;