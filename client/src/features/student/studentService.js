// src/features/student/studentService.js
import api from '../../api/axios';

const getLearnerNotes = async (subStrandId) => (await api.get(`/api/student/notes/${subStrandId}`)).data;
const getQuizzes = async (subStrandId) => (await api.get(`/api/student/quizzes/${subStrandId}`)).data;
const getResources = async (subStrandId) => (await api.get(`/api/student/resources/${subStrandId}`)).data;
const getQuizDetails = async (quizId) => (await api.get(`/api/student/quiz/${quizId}`)).data;
const submitQuiz = async ({ quizId, answers }) => (await api.post(`/api/student/quiz/${quizId}/submit`, { answers })).data;
const getMyBadges = async () => (await api.get('/api/student/my-badges')).data;
const logNoteView = async (noteId) => (await api.post(`/api/student/notes/${noteId}/view`)).data;
const getAiInsights = async () => {
  const response = await api.get('/api/student/ai-insights');
  return response.data;
};

export default { getLearnerNotes, getQuizzes, getResources, getQuizDetails, submitQuiz, getMyBadges, getAiInsights, logNoteView };