// /client/src/features/teacher/teacherService.js
import api from '../../api/axios';

const getMyLessonNotes = async () => {
  // ✅ FIX: Added /api prefix
  const response = await api.get('/api/teacher/lesson-notes');
  return response.data;
};

const generateLessonNote = async (noteData) => {
  // ✅ FIX: Added /api prefix
  const response = await api.post('/api/teacher/generate-note', noteData);
  return response.data;
};

const getLessonNoteById = async (noteId) => {
  // ✅ FIX: Added /api prefix
  const response = await api.get(`/api/teacher/lesson-notes/${noteId}`);
  return response.data;
};

const deleteLessonNote = async (noteId) => {
  // ✅ FIX: Added /api prefix
  const response = await api.delete(`/api/teacher/lesson-notes/${noteId}`);
  return response.data;
};

/** ✅ Generates learner-friendly version of a note **/
const generateLearnerNote = async (lessonNoteId) => {
  // ✅ FIX: Added /api prefix
  const response = await api.post('/api/teacher/generate-learner-note', { lessonNoteId });
  return response.data;
};

/** ✅ Retrieves overall dashboard stats **/
const getTeacherAnalytics = async () => {
  // ✅ FIX: Added /api prefix
  const response = await api.get('/api/teacher/analytics');
  return response.data;
};

/** ✅ Draft learner notes (before publishing) **/
const getDraftLearnerNotes = async () => {
  // ✅ FIX: Added /api prefix
  const response = await api.get('/api/teacher/learner-notes/drafts');
  return response.data;
};

const publishLearnerNote = async (noteId) => {
  // ✅ FIX: Added /api prefix
  const response = await api.put(`/api/teacher/learner-notes/${noteId}/publish`);
  return response.data;
};

const deleteLearnerNote = async (noteId) => {
  // ✅ FIX: Added /api prefix
  const response = await api.delete(`/api/teacher/learner-notes/${noteId}`);
  return response.data;
};

/** ✅ AI-generated quizzes **/
const generateAiQuiz = async (quizData) => {
  // ✅ FIX: Added /api prefix
  const response = await api.post('/api/teacher/quizzes/generate-ai', quizData);
  return response.data;
};

/** 🧠 NEW: Teacher AI insights **/
const getAiInsights = async () => {
  try {
    // ✅ FIX: Added /api prefix
    const response = await api.get('/api/teacher/ai-insights');
    return response.data;
  } catch (err) {
    console.error('AI Insights fetch failed:', err.message);
    return {
      message: 'AI insights unavailable at this moment. Try again later.',
      summary: '',
    };
  }
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
};

export default teacherService;