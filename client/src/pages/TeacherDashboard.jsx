import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Redux Imports ---
import { fetchItems, fetchChildren, clearChildren } from '../features/curriculum/curriculumSlice';
import { generateLessonNote, getMyLessonNotes, deleteLessonNote, resetTeacherState } from '../features/teacher/teacherSlice';

// --- Component & Helper Imports ---
import LessonNoteForm from '../components/LessonNoteForm';
// Make sure you have the download helper utility from the previous steps
// import { downloadLessonNoteAsPdf, downloadAsWord } from '../utils/downloadHelper';

// --- MUI Imports ---
import {
  Box, Typography, Container, Button, Grid, Select, MenuItem, FormControl,
  InputLabel, Paper, List, ListItem, ListItemText, ListItemButton, CircularProgress,
  Stack, IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Snackbar, Alert,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { lessonNotes, isLoading, isError, message } = useSelector((state) => state.teacher);

  // State management
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- Effects for data fetching and state management ---
  useEffect(() => {
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      setSnackbar({ open: true, message, severity: isError ? 'error' : 'success' });
    }
    return () => { if (message) dispatch(resetTeacherState()); };
  }, [message, isError, dispatch]);

  // Chained dropdown fetching effects
  useEffect(() => { if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })); }, [selections.level, dispatch]);
  useEffect(() => { if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })); }, [selections.class, dispatch]);
  useEffect(() => { if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })); }, [selections.subject, dispatch]);
  useEffect(() => { if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })); }, [selections.strand, dispatch]);

  // --- Handlers ---
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

  const handleGenerateNote = useCallback((formData) => {
    dispatch(generateLessonNote({ ...formData, subStrandId: selections.subStrand }))
      .unwrap()
      .then(() => setIsModalOpen(false))
      .catch(() => {});
  }, [dispatch, selections.subStrand]);

  const handleConfirmDelete = useCallback(() => {
    if (noteToDelete) {
      dispatch(deleteLessonNote(noteToDelete));
      setNoteToDelete(null);
    }
  }, [dispatch, noteToDelete]);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
  
  // Reusable dropdown component
  const renderDropdown = (name, label, value, items, disabled = false) => (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select name={name} value={value} label={label} onChange={handleSelectionChange}>
        {items.map((item) => (
          <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">Teacher Dashboard</Typography>
        </Box>

        {/* --- 📍 START OF MISSING UI CODE --- */}
        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <Typography variant="h6" gutterBottom>Select Topic to Generate Note</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('level', 'Level', selections.level, levels)}</Grid>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('class', 'Class', selections.class, classes, !selections.level)}</Grid>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('subject', 'Subject', selections.subject, subjects, !selections.class)}</Grid>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('strand', 'Strand', selections.strand, strands, !selections.subject)}</Grid>
            <Grid item xs={12}>{renderDropdown('subStrand', 'Sub-Strand', selections.subStrand, subStrands, !selections.strand)}</Grid>
          </Grid>
          <Button variant="contained" onClick={() => setIsModalOpen(true)} disabled={!selections.subStrand || isLoading} sx={{ mt: 2 }}>
            Generate AI Lesson Note
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>My Generated Lesson Notes</Typography>
          {isLoading && lessonNotes.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
          ) : (
            <List>
              {lessonNotes.length > 0 ? lessonNotes.map((note) => (
                <ListItem key={note._id} disablePadding secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => setNoteToDelete(note._id)}>
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemButton component={RouterLink} to={`/teacher/notes/${note._id}`}>
                    <ArticleIcon sx={{ mr: 2, color: 'action.active' }} />
                    <ListItemText
                      primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
                      primary={`Note from ${new Date(note.createdAt).toLocaleDateString()}`}
                      secondary={note.content.substring(0, 150) + '...'}
                    />
                  </ListItemButton>
                </ListItem>
              )) : (
                <Typography color="text.secondary" sx={{ p: 2 }}>You haven't generated any lesson notes yet.</Typography>
              )}
            </List>
          )}
        </Paper>
        {/* --- 📍 END OF MISSING UI CODE --- */}

        <LessonNoteForm
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleGenerateNote}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          isLoading={isLoading}
        />

        <Dialog open={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this lesson note? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteToDelete(null)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;