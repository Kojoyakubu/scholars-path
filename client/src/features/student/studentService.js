// src/features/student/studentService.js
import api from '../../api/axios';

const getLearnerNotes = async (subStrandId) => (await api.get(`/student/notes/${subStrandId}`)).data;
const getQuizzes = async (subStrandId) => (await api.get(`/student/quizzes/${subStrandId}`)).data;
const getResources = async (subStrandId) => (await api.get(`/student/resources/${subStrandId}`)).data;
const getQuizDetails = async (quizId) => (await api.get(`/student/quiz/${quizId}`)).data;
const submitQuiz = async ({ quizId, answers }) => (await api.post(`/student/quiz/${quizId}/submit`, { answers })).data;
const getMyBadges = async () => (await api.get('/student/my-badges')).data;
const logNoteView = async (noteId) => (await api.post(`/student/notes/${noteId}/view`)).data;

export default { getLearnerNotes, getQuizzes, getResources, getQuizDetails, submitQuiz, getMyBadges, logNoteView };
