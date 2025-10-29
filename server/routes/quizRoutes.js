const express = require('express');
const router = express.Router();

const {
  generateAiQuiz,
  getMyQuizzes,
  deleteQuiz,
  getQuizDetails,
  duplicateQuiz,
} = require('../controllers/quizController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ==============================
// Teacher: AI Quiz Generation & Management
// ==============================
router.post('/ai/generate', protect, authorize('teacher'), generateAiQuiz);
router.get('/', protect, authorize('teacher'), getMyQuizzes);
router.get('/:id', protect, authorize('teacher'), getQuizDetails);
router.delete('/:id', protect, authorize('teacher'), deleteQuiz);
router.post('/:id/duplicate', protect, authorize('teacher'), duplicateQuiz);

module.exports = router;
