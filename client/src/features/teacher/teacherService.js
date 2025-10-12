// teacherService.js
const API_URL = '/api/teacher/lesson-notes/';

// Get user token
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token || '';
};

// --- Generate new lesson note ---
const generateLessonNote = async (noteData) => {
  const token = getToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) throw new Error('Failed to generate note');
  return await response.json();
};

// --- Get all lesson notes for current teacher ---
const getMyLessonNotes = async () => {
  const token = getToken();
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch notes');
  return await response.json();
};

// --- Get single lesson note by ID ---
const getLessonNoteById = async (noteId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}${noteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch note');
  return await response.json();
};

// --- ✅ Delete lesson note ---
const deleteLessonNote = async (noteId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}${noteId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to delete note');
  return await response.json();
};

const teacherService = {
  generateLessonNote,
  getMyLessonNotes,
  getLessonNoteById,
  deleteLessonNote, // ✅ export added
};

export default teacherService;
