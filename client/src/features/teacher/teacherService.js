import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/teacher/';
// The endpoint for getting resources is on the student route
const STUDENT_API_URL = '/api/student/';

const getConfig = (token, isMultipart = false) => ({
  headers: {
    ...isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
    Authorization: `Bearer ${token}`,
  },
});

// Generate a lesson note
const generateLessonNote = async (noteData, token) => {
    const response = await axios.post(API_URL + 'generate-note', noteData, getConfig(token));
    return response.data;
};

// Generate a learner note
const generateLearnerNote = async (noteData, token) => {
    const response = await axios.post(API_URL + 'generate-learner-note', noteData, getConfig(token));
    return response.data;
};

// Create a new quiz
const createQuiz = async (quizData, token) => {
    const response = await axios.post(API_URL + 'create-quiz', quizData, getConfig(token));
    return response.data;
};

// Generate a single AI question
const generateAiQuestion = async (questionData, token) => {
    const response = await axios.post(API_URL + 'generate-ai-question', questionData, getConfig(token));
    return response.data;
};

// Upload a resource file
const uploadResource = async (resourceFormData, token) => {
    const response = await axios.post(API_URL + 'upload-resource', resourceFormData, getConfig(token, true));
    return response.data;
};

// Get resources for a sub-strand (uses student endpoint)
const getResources = async (subStrandId, token) => {
    const response = await axios.get(STUDENT_API_URL + `resources/${subStrandId}`, getConfig(token));
    return response.data;
};

// Generate a quiz section with AI
const generateAiQuizSection = async (wizardData, token) => {
    const response = await axios.post(API_URL + 'generate-ai-quiz-section', wizardData, getConfig(token));
    return response.data;
};

// Get analytics for the logged-in teacher
const getTeacherAnalytics = async (token) => {
    const response = await axios.get(API_URL + 'analytics', getConfig(token));
    return response.data;
};


const teacherService = {
    generateLessonNote,
    generateLearnerNote,
    createQuiz,
    generateAiQuestion,
    uploadResource,
    getResources,
    generateAiQuizSection,
    getTeacherAnalytics,
};

export default teacherService;