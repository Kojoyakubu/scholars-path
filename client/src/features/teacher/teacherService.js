import api from '../../api/axios';

const getMyLessonNotes = async () => {
    const response = await api.get('/teacher/lessonnotes');
    return response.data;
};

const generateLessonNote = async (noteData) => {
    const response = await api.post('/teacher/generate-note', noteData);
    return response.data;
};

const getLessonNoteById = async (noteId) => {
    const response = await api.get(`/teacher/notes/${noteId}`);
    return response.data;
};

const createQuiz = async (quizData) => {
    const response = await api.post('/teacher/create-quiz', quizData);
    return response.data;
};

const uploadResource = async (resourceFormData) => {
    const response = await api.post('/teacher/upload-resource', resourceFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const getTeacherAnalytics = async () => {
    const response = await api.get('/teacher/analytics');
    return response.data;
};

const teacherService = {
    getMyLessonNotes,
    generateLessonNote,
    getLessonNoteById,
    createQuiz,
    uploadResource,
    getTeacherAnalytics,
};

export default teacherService;