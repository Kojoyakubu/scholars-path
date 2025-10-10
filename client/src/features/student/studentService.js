import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/api/student/';

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get learner notes for a sub-strand
const getLearnerNotes = async (subStrandId, token) => {
  const response = await axios.get(API_URL + `notes/${subStrandId}`, getConfig(token));
  return response.data;
};

// Get quizzes for a sub-strand
const getQuizzes = async (subStrandId, token) => {
  const response = await axios.get(API_URL + `quizzes/${subStrandId}`, getConfig(token));
  return response.data;
};

// Get resources for a sub-strand
const getResources = async (subStrandId, token) => {
  const response = await axios.get(API_URL + `resources/${subStrandId}`, getConfig(token));
  return response.data;
};

// Get details for a single quiz
const getQuizDetails = async (quizId, token) => {
  const response = await axios.get(API_URL + `quiz/${quizId}`, getConfig(token));
  return response.data;
};

// Submit quiz answers
const submitQuiz = async (quizData, token) => {
  const { quizId, answers } = quizData;
  const response = await axios.post(API_URL + `quiz/${quizId}/submit`, { answers }, getConfig(token));
  return response.data;
};

// Get the current student's badges
const getMyBadges = async (token) => {
  const response = await axios.get(API_URL + 'my-badges', getConfig(token));
  return response.data;
};

// Log that a student has viewed a note
const logNoteView = async (noteId, token) => {
  const response = await axios.post(API_URL + `notes/${noteId}/view`, {}, getConfig(token));
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