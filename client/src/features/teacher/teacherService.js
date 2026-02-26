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

// generate learner note based on a curriculum strand/sub-strand
const generateLearnerNoteFromStrand = async (payload) => {
  const response = await api.post('/api/teacher/ai/generate-learner-note-from-strand', payload);
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
  // route defined in server/routes/quizRoutes.js as POST /api/quizzes/ai/generate
  // quizData should contain topic, subjectName, className, numQuestions etc.
  // optionally a subjectId can be supplied (preferred) and/or subStrandId
  // to allow the server to look up and store the proper ObjectId instead of a
  // plain string.
  const response = await api.post('/api/quizzes/ai/generate', quizData);
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

// ✅ NEW: Bundle CRUD operations
const getMyBundles = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/api/teacher/bundles${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

const getBundleById = async (bundleId) => {
  const response = await api.get(`/api/teacher/bundles/${bundleId}`);
  return response.data;
};

const updateBundle = async ({ bundleId, bundleData }) => {
  const response = await api.put(`/api/teacher/bundles/${bundleId}`, bundleData);
  return response.data;
};

const deleteBundle = async (bundleId) => {
  const response = await api.delete(`/api/teacher/bundles/${bundleId}`);
  return response.data;
};

const duplicateBundle = async (bundleId) => {
  const response = await api.post(`/api/teacher/bundles/${bundleId}/duplicate`);
  return response.data;
};

const getMyQuizzes = async () => {
  const response = await api.get('/api/quizzes');
  return response.data;
};

const deleteQuiz = async (quizId) => {
  const response = await api.delete(`/api/quizzes/${quizId}`);
  return response.data;
};

const teacherService = {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  deleteLessonNote,
  generateLearnerNote,
  generateLearnerNoteFromStrand,
  getTeacherAnalytics,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote,
  generateAiQuiz,
  getAiInsights,
  generateLessonBundle, // ✅ NEW: Bundle generation
  getMyBundles,
  getBundleById,
  updateBundle,
  deleteBundle,
  duplicateBundle,
  getMyQuizzes,
  deleteQuiz,

  // retrieve single quiz with populated questions/options
  getQuizById: async (quizId) => {
    const response = await api.get(`/api/quizzes/${quizId}`);
    return response.data;
  },
};

export default teacherService;