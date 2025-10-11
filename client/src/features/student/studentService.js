// src/features/student/studentService.js (Revised)

import api from '../../api/axios'; // <-- Import our new centralized instance

// Get learner notes for a sub-strand
const getLearnerNotes = async (subStrandId) => {
  const response = await api.get(`/student/notes/${subStrandId}`);
  return response.data;
};

// Get quizzes for a sub-strand
const getQuizzes = async (subStrandId) => {
  const response = await api.get(`/student/quizzes/${subStrandId}`);
  return response.data;
};

// Get resources for a sub-strand
const getResources = async (subStrandId) => {
  const response = await api.get(`/student/resources/${subStrandId}`);
  return response.data;
};

// Get details for a single quiz
const getQuizDetails = async (quizId) => {
  const response = await api.get(`/student/quiz/${quizId}`);
  return response.data;
};

// Submit quiz answers
const submitQuiz = async (quizData) => {
  const { quizId, answers } = quizData;
  const response = await api.post(`/student/quiz/${quizId}/submit`, { answers });
  return response.data;
};

// Get the current student's badges
const getMyBadges = async () => {
  const response = await api.get('/student/my-badges');
  return response.data;
};

// Log that a student has viewed a note
const logNoteView = async (noteId) => {
  // We don't need to pass an empty object for a POST request body
  const response = await api.post(`/student/notes/${noteId}/view`);
  return response.data;
};

const studentService = {
  getLearnerNotes,
  getQuizzes,
  getResources,
  getQuizDetails,
  submitQuiz,
  getMyBadges,
  logNoteView,
};

export default studentService;