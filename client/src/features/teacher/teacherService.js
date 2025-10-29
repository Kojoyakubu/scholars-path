import api from './api/axios';

const getMyLessonNotes = async () => {
  const response = await api.get('/teacher/lesson-notes');
  return response.data;
};

const generateLessonNote = async (noteData) => {
  const response = await api.post('/teacher/generate-note', noteData);
  return response.data;
};

const getLessonNoteById = async (noteId) => {
  const response = await api.get(`/teacher/lesson-notes/${noteId}`);
  return response.data;
};

const deleteLessonNote = async (noteId) => {
  const response = await api.delete(`/teacher/lesson-notes/${noteId}`);
  return response.data;
};

/** ✅ Generates learner-friendly version of a note **/
const generateLearnerNote = async (lessonNoteId) => {
  const response = await api.post('/teacher/generate-learner-note', { lessonNoteId });
  return response.data;
};

/** ✅ Retrieves overall dashboard stats **/
const getTeacherAnalytics = async () => {
  const response = await api.get('/teacher/analytics');
  return response.data;
};

/** ✅ Draft learner notes (before publishing) **/
const getDraftLearnerNotes = async () => {
  const response = await api.get('/teacher/learner-notes/drafts');
  return response.data;
};

const publishLearnerNote = async (noteId) => {
  const response = await api.put(`/teacher/learner-notes/${noteId}/publish`);
  return response.data;
};

const deleteLearnerNote = async (noteId) => {
  const response = await api.delete(`/teacher/learner-notes/${noteId}`);
  return response.data;
};

/** ✅ AI-generated quizzes **/
const generateAiQuiz = async (quizData) => {
  const response = await api.post('/teacher/quizzes/generate-ai', quizData);
  return response.data;
};

/** 🧠 NEW: Teacher AI insights **/
const getAiInsights = async () => {
  try {
    const response = await api.get('/teacher/ai-insights');
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
  getAiInsights, // ✅ added here
};

export default teacherService;
