const express = require('express');
const router = express.Router();
const { 
  generateLessonNote, 
  generateLearnerNote, 
  createQuiz, 
  generateAiQuestion,
  uploadResource,
  generateAiQuizSection,
  getTeacherAnalytics,
} = require('../controllers/teacherController');
const { protect, teacher } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect, teacher, checkSubscription);

router.post('/generate-note', protect, teacher, generateLessonNote);
router.post('/generate-learner-note', protect, teacher, generateLearnerNote);
router.post('/create-quiz', protect, teacher, createQuiz);
router.post('/generate-ai-question', protect, teacher, generateAiQuestion);
router.post('/upload-resource', protect, teacher, upload, uploadResource);
router.post('/generate-ai-quiz-section', protect, teacher, generateAiQuizSection);
router.get('/analytics', protect, teacher, getTeacherAnalytics); // Added

module.exports = router;