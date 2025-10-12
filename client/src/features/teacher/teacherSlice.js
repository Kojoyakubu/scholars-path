// teacherSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teacherService from './teacherService';

// --- Generate new note ---
export const generateLessonNote = createAsyncThunk(
  'teacher/generateLessonNote',
  async (noteData, thunkAPI) => {
    try {
      return await teacherService.generateLessonNote(noteData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Get all notes ---
export const getMyLessonNotes = createAsyncThunk(
  'teacher/getMyLessonNotes',
  async (_, thunkAPI) => {
    try {
      return await teacherService.getMyLessonNotes();
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Get note by ID ---
export const getLessonNoteById = createAsyncThunk(
  'teacher/getLessonNoteById',
  async (noteId, thunkAPI) => {
    try {
      return await teacherService.getLessonNoteById(noteId);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- ✅ Delete lesson note ---
export const deleteLessonNote = createAsyncThunk(
  'teacher/deleteLessonNote',
  async (noteId, thunkAPI) => {
    try {
      return await teacherService.deleteLessonNote(noteId);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  lessonNotes: [],
  currentNote: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    resetTeacherState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetCurrentNote: (state) => {
      state.currentNote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // generate note
      .addCase(generateLessonNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateLessonNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lessonNotes.unshift(action.payload);
      })
      .addCase(generateLessonNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // get all notes
      .addCase(getMyLessonNotes.fulfilled, (state, action) => {
        state.lessonNotes = action.payload;
      })

      // get note by id
      .addCase(getLessonNoteById.fulfilled, (state, action) => {
        state.currentNote = action.payload;
      })

      // ✅ delete note
      .addCase(deleteLessonNote.fulfilled, (state, action) => {
        state.lessonNotes = state.lessonNotes.filter(
          (note) => note._id !== action.payload._id
        );
      });
  },
});

export const { resetTeacherState, resetCurrentNote } = teacherSlice.actions;
export default teacherSlice.reducer;
