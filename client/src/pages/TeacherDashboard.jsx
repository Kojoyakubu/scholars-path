import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchItems,
  fetchChildren,
  clearChildren,
} from '../features/curriculum/curriculumSlice';
import {
  generateLessonNote,
  getMyLessonNotes,
  deleteLessonNote,
  resetTeacherState, // Make sure reset is imported to clear messages
} from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import HTMLtoDOCX from 'html-docx-js-typescript';

// ✅ 1. ADD MUI DIALOG AND SNACKBAR IMPORTS
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Stack,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands } = useSelector(
    (state) => state.curriculum
  );
  // Destructure message, isError, isSuccess from the teacher state
  const { lessonNotes, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.teacher
  );

  const [selections, setSelections] = useState({
    level: '',
    class: '',
    subject: '',
    strand: '',
    subStrand: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ 2. ADD STATE FOR DIALOG AND SNACKBAR
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(getMyLessonNotes());
    dispatch(fetchItems({ entity: 'levels' }));
    return () => {
      dispatch(resetTeacherState());
    };
  }, [dispatch]);

  // Effect to show snackbar on success or error
  useEffect(() => {
    if (isSuccess && message) {
      setSnackbar({ open: true, message, severity: 'success' });
      dispatch(resetTeacherState());
    }
    if (isError && message) {
      setSnackbar({ open: true, message, severity: 'error' });
      dispatch(resetTeacherState());
    }
  }, [isSuccess, isError, message, dispatch]);

  // Chain dropdowns
  useEffect(() => { if (selections.level) { dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })); } }, [selections.level, dispatch]);
  useEffect(() => { if (selections.class) { dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })); } }, [selections.class, dispatch]);
  useEffect(() => { if (selections.subject) { dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })); } }, [selections.subject, dispatch]);
  useEffect(() => { if (selections.strand) { dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })); } }, [selections.strand, dispatch]);

  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const newSelections = { ...prev, [name]: value };
      const resetMap = {
        level: ['class', 'subject', 'strand', 'subStrand'],
        class: ['subject', 'strand', 'subStrand'],
        subject: ['strand', 'subStrand'],
        strand: ['subStrand'],
      };
      if (resetMap[name]) {
        resetMap[name].forEach((key) => (newSelections[key] = ''));
        dispatch(clearChildren({ entities: resetMap[name] }));
      }
      return newSelections;
    });
  }, [dispatch]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleGenerateNote = useCallback((formData) => {
    const noteData = { ...formData, subStrandId: selections.subStrand };
    dispatch(generateLessonNote(noteData));
  }, [dispatch, selections.subStrand]);

  useEffect(() => {
    if (isSuccess && isModalOpen) {
      handleCloseModal();
    }
  }, [isSuccess, isModalOpen]);

  // ✅ 3. MODIFY DELETE HANDLER TO USE THE DIALOG
  const handleDeleteClick = (noteId) => {
    setNoteToDelete(noteId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      dispatch(deleteLessonNote(noteToDelete));
    }
    handleDialogClose();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // --- DOWNLOAD HANDLERS (No alerts needed, using Snackbar now) ---
  const handleDownloadPdf = useCallback((noteId, noteTopic) => {
    // ... (rest of the function is the same, just remove alert())
    const element = document.getElementById(`note-content-${noteId}`);
    if (!element) return;
    if (!window.html2pdf) {
      console.error('html2pdf library not loaded!');
      setSnackbar({ open: true, message: 'PDF generation failed. Please refresh.', severity: 'error' });
      return;
    }
    //... (pdf generation logic)
  }, []);

  const handleDownloadWord = useCallback((noteId, noteTopic) => {
    // ... (rest of the function is the same, just remove alert())
    try {
      const element = document.getElementById(`note-content-${noteId}`);
      if (!element) {
          setSnackbar({ open: true, message: 'Note content not found.', severity: 'error' });
          return;
      }
      //... (docx generation logic)
    } catch (err) {
      console.error('Word generation failed:', err);
      setSnackbar({ open: true, message: 'Could not generate Word document.', severity: 'error' });
    }
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        {/* Main Content */}
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">Teacher Dashboard</Typography>
        </Box>

        {/* Note Generator Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          {/* ... (Your dropdowns and generate button) ... */}
        </Paper>

        {/* Lesson Notes List */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>My Generated Lesson Notes</Typography>
          {isLoading && lessonNotes.length === 0 ? (
            <CircularProgress />
          ) : (
            <List>
              {lessonNotes.map((note) => (
                <ListItem
                  key={note._id}
                  disablePadding
                  secondaryAction={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {/* ... Download Buttons ... */}
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(note._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemButton component={RouterLink} to={`/teacher/notes/${note._id}`}>
                    <ArticleIcon sx={{ mr: 2, color: 'action.active' }} />
                    <ListItemText
                      primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
                      primary={note.content.split('\n')[1] || `Note created on ${new Date(note.createdAt).toLocaleDateString()}`}
                      secondary={note.content.substring(0, 150) + '...'}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <LessonNoteForm
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleGenerateNote}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          isLoading={isLoading}
        />

        {/* ✅ 4. ADD DIALOG AND SNACKBAR COMPONENTS TO THE RENDER OUTPUT */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to permanently delete this lesson note? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;