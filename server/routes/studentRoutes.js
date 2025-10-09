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
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

router.use(protect, authorize('student', 'admin'));//, checkSubscription);

router.get('/notes/:subStrandId', getLearnerNotes);
router.get('/quizzes/:subStrandId', getQuizzes);
router.get('/resources/:subStrandId', getResources);
router.get('/quiz/:id', getQuizDetails);
router.post('/quiz/:id/submit', submitQuiz);
router.get('/my-badges', getMyBadges);
router.post('/notes/:id/view', logNoteView);

module.exports = router;