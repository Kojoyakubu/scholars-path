import api from '../../api/axios';

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

/** ✅ ADD THIS FUNCTION **/
const generateLearnerNote = async (lessonNoteId) => {
  const response = await api.post('/teacher/generate-learner-note', { lessonNoteId });
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
    deleteLessonNote,
    generateLearnerNote, // ✅ EXPORT THE NEW FUNCTION
    getTeacherAnalytics,
};

export default teacherService;