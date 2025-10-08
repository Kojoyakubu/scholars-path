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
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.use(protect, checkSubscription);

router.get('/notes/:subStrandId', protect, getLearnerNotes);
router.get('/quizzes/:subStrandId', protect, getQuizzes);
router.get('/resources/:subStrandId', protect, getResources);
router.get('/quiz/:id', protect, getQuizDetails);
router.post('/quiz/:id/submit', protect, submitQuiz);
router.get('/my-badges', protect, getMyBadges);
router.post('/notes/:id/view', protect, logNoteView);

module.exports = router;