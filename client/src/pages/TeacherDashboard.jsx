import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Redux Imports ---
import { fetchItems, fetchChildren, clearChildren } from '../features/curriculum/curriculumSlice';
import {
  generateLessonNote,
  getMyLessonNotes,
  deleteLessonNote,
  generateLearnerNote, // Import the new action
  resetTeacherState,
} from '../features/teacher/teacherSlice';

// --- Component & Helper Imports ---
import LessonNoteForm from '../components/LessonNoteForm';

// --- MUI Imports ---
import {
  Box, Typography, Container, Button, Grid, Select, MenuItem, FormControl,
  InputLabel, Paper, List, ListItem, ListItemText, ListItemButton, CircularProgress,
  Stack, IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Snackbar, Alert, Tooltip,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural'; // New Icon

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { lessonNotes, isLoading, isError, message } = useSelector((state) => state.teacher);

  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generatingNoteId, setGeneratingNoteId] = useState(null);

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

  useEffect(() => { if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })); }, [selections.level, dispatch]);
  useEffect(() => { if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })); }, [selections.class, dispatch]);
  useEffect(() => { if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })); }, [selections.subject, dispatch]);
  useEffect(() => { if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })); }, [selections.strand, dispatch]);

  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const newSelections = { ...prev, [name]: value };
      const resetMap = {
        level: ['class', 'subject', 'strand', 'subStrand'], class: ['subject', 'strand', 'subStrand'],
        subject: ['strand', 'subStrand'], strand: ['subStrand'],
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
      .unwrap().then(() => setIsModalOpen(false)).catch(() => {});
  }, [dispatch, selections.subStrand]);

  const handleConfirmDelete = useCallback(() => {
    if (noteToDelete) {
      dispatch(deleteLessonNote(noteToDelete));
      setNoteToDelete(null);
    }
  }, [dispatch, noteToDelete]);
  
  // ✅ NEW HANDLER
  const handleGenerateLearnerNote = useCallback((lessonNoteId) => {
    setGeneratingNoteId(lessonNoteId);
    dispatch(generateLearnerNote(lessonNoteId))
      .unwrap()
      .catch(() => {})
      .finally(() => setGeneratingNoteId(null));
  }, [dispatch]);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const renderDropdown = (name, label, value, items, disabled = false) => (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select name={name} value={value} label={label} onChange={handleSelectionChange}>
        {items.map((item) => (<MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>))}
      </Select>
    </FormControl>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}><Typography variant="h4" component="h1">Teacher Dashboard</Typography></Box>
        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
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
          {isLoading && lessonNotes.length === 0 ? (<Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>) : (
            <List>
              {lessonNotes.map((note) => (
                <ListItem key={note._id} disablePadding secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* ✅ NEW BUTTON UI */}
                    <Tooltip title="Generate Learner's Version">
                      <IconButton
                        edge="end"
                        aria-label="generate learner note"
                        onClick={() => handleGenerateLearnerNote(note._id)}
                        disabled={generatingNoteId === note._id}
                      >
                        {generatingNoteId === note._id ? <CircularProgress size={24} /> : <FaceRetouchingNaturalIcon color="primary" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Note">
                      <IconButton edge="end" aria-label="delete" onClick={() => setNoteToDelete(note._id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }>
                  <ListItemButton component={RouterLink} to={`/teacher/notes/${note._id}`}>
                    <ArticleIcon sx={{ mr: 2, color: 'action.active' }} />
                    <ListItemText
                      primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
                      primary={`Note from ${new Date(note.createdAt).toLocaleDateString()}`}
                      secondary={note.content.substring(0, 100) + '...'}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
        
        <LessonNoteForm open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleGenerateNote} subStrandName={subStrands.find(s => s._id === selections.subStrand)?.name || ''} isLoading={isLoading} />
        <Dialog open={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to permanently delete this lesson note?</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteToDelete(null)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;