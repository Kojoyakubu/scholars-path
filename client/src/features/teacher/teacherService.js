import api from '../../api/axios';

/** Fetches all lesson notes for the currently logged-in teacher. */
const getMyLessonNotes = async () => {
  const response = await api.get('/teacher/lesson-notes'); // Corrected endpoint
  return response.data;
};

/** Sends data to the backend to generate a new lesson note using AI. */
const generateLessonNote = async (noteData) => {
  const response = await api.post('/teacher/generate-note', noteData);
  return response.data;
};

/** Fetches a single, specific lesson note by its ID. */
const getLessonNoteById = async (noteId) => {
  const response = await api.get(`/teacher/lesson-notes/${noteId}`); // Corrected endpoint
  return response.data;
};

/** Deletes a specific lesson note by its ID. */
const deleteLessonNote = async (noteId) => {
  const response = await api.delete(`/teacher/lesson-notes/${noteId}`); // Corrected endpoint
  return response.data; // Returns { id, message }
};

/** Fetches analytics data for the teacher dashboard. */
const getTeacherAnalytics = async () => {
  const response = await api.get('/teacher/analytics');
  return response.data;
};

const teacherService = {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  deleteLessonNote,
  getTeacherAnalytics,
};

export default teacherService;