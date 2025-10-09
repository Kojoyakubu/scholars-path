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
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect, authorize('teacher', 'school_admin', 'admin'));//, checkSubscription);

router.post('/generate-note', generateLessonNote);
router.post('/generate-learner-note', generateLearnerNote);
router.post('/create-quiz', createQuiz);
router.post('/generate-ai-question', generateAiQuestion);
router.post('/upload-resource', upload, uploadResource);
router.post('/generate-ai-quiz-section', generateAiQuizSection);
router.get('/analytics', getTeacherAnalytics);

module.exports = router;