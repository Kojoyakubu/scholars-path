// /client/src/features/teacher/teacherService.js
import api from '../../api/axios';

const getMyLessonNotes = async () => {
  const response = await api.get('/api/teacher/lesson-notes');
  return response.data;
};

// ✅ FIX: Changed from /generate-note to /ai/generate-note
const generateLessonNote = async (noteData) => {
  const response = await api.post('/api/teacher/ai/generate-note', noteData);
  return response.data;
};

const getLessonNoteById = async (noteId) => {
  const response = await api.get(`/api/teacher/lesson-notes/${noteId}`);
  return response.data;
};

const deleteLessonNote = async (noteId) => {
  const response = await api.delete(`/api/teacher/lesson-notes/${noteId}`);
  return response.data;
};

// ✅ FIX: Changed from /generate-learner-note to /ai/generate-learner-note
const generateLearnerNote = async (lessonNoteId) => {
  const response = await api.post('/api/teacher/ai/generate-learner-note', { lessonNoteId });
  return response.data;
};

const getTeacherAnalytics = async () => {
  const response = await api.get('/api/teacher/analytics');
  return response.data;
};

const getDraftLearnerNotes = async () => {
  const response = await api.get('/api/teacher/learner-notes/drafts');
  return response.data;
};

const publishLearnerNote = async (noteId) => {
  const response = await api.put(`/api/teacher/learner-notes/${noteId}/publish`);
  return response.data;
};

const deleteLearnerNote = async (noteId) => {
  const response = await api.delete(`/api/teacher/learner-notes/${noteId}`);
  return response.data;
};

// ✅ FIX: Updated quiz generation route (check your backend for correct path)
const generateAiQuiz = async (quizData) => {
  const response = await api.post('/api/quizzes/generate-ai', quizData);
  return response.data;
};

const getAiInsights = async () => {
  try {
    const response = await api.get('/api/teacher/insights');
    return response.data;
  } catch (err) {
    console.error('AI Insights fetch failed:', err.message);
    return {
      message: 'AI insights unavailable at this moment. Try again later.',
      summary: '',
    };
  }
};

// ✅ NEW: Generate complete lesson bundle (Teacher Note + Learner Note + Quiz)
const generateLessonBundle = async (bundleData) => {
  const response = await api.post('/api/teacher/ai/generate-lesson-bundle', bundleData);
  return response.data;
};

const teacherService = {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  deleteLessonNote,
  generateLearnerNote,
  getTeacherAnalytics,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote,
  generateAiQuiz,
  getAiInsights,
  generateLessonBundle, // ✅ NEW: Bundle generation
};

export default teacherService;