// /server/routes/studentRoutes.js
const express = require('express');
const router = express.Router();

const {
  getCurrentQuiz,
  getQuizInsights,
  getMyBadges,
  getResources,
  getLearnerNotes,
  logNoteView,
} = require('../controllers/studentController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Quizzes
router.get('/quiz/current', protect, authorize('student'), getCurrentQuiz);
router.post('/quiz/insights', protect, authorize('student'), getQuizInsights);

// Learning data
router.get('/badges', protect, authorize('student'), getMyBadges);
router.get('/resources', protect, authorize('student'), getResources);
router.get('/learner-notes', protect, authorize('student'), getLearnerNotes);
router.post('/note-views/:noteId', protect, authorize('student'), logNoteView);

module.exports = router;
