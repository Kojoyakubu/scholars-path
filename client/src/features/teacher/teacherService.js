// src/features/teacher/teacherService.js (Revised)

import api from '../../api/axios'; // <-- Import our new centralized instance

// Get all lesson notes for the logged-in teacher
const getMyLessonNotes = async () => {
    const response = await api.get('/teacher/lessonnotes');
    return response.data;
};

// Generate a lesson note with AI
const generateLessonNote = async (noteData) => {
    const response = await api.post('/teacher/generate-note', noteData);
    return response.data;
};

// Create a new quiz
const createQuiz = async (quizData) => {
    const response = await api.post('/teacher/create-quiz', quizData);
    return response.data;
};

// Upload a resource file
const uploadResource = async (resourceFormData) => {
    // For multipart/form-data, we need to specify the header explicitly
    const response = await api.post('/teacher/upload-resource', resourceFormData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Get analytics for the logged-in teacher
const getTeacherAnalytics = async () => {
    const response = await api.get('/teacher/analytics');
    return response.data;
};

// NOTE: Other functions like generateAiQuestion, generateLearnerNote, etc., would follow the same pattern.

const teacherService = {
    getMyLessonNotes,
    generateLessonNote,
    createQuiz,
    uploadResource,
    getTeacherAnalytics,
};

export default teacherService;