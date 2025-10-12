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
  resetTeacherState,
} from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import HTMLtoDOCX from 'html-docx-js-typescript';

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
import DeleteIcon from '@mui/icons-material/Delete';

function TeacherDashboard() {
  const dispatch = useDispatch();

  // ✅ 1. SEPARATE THE STATE SELECTORS FOR CLARITY
  const { levels, classes, subjects, strands, subStrands, isLoading: curriculumLoading } = useSelector(
    (state) => state.curriculum
  );
  const { lessonNotes, isLoading: teacherLoading, isError, message } = useSelector(
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
  }, [dispatch]);

  // Effect to show notifications
  useEffect(() => {
    if (message) {
      setSnackbar({
        open: true,
        message,
        severity: isError ? 'error' : 'success',
      });
      dispatch(resetTeacherState());
    }
  }, [message, isError, dispatch]);

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
    dispatch(generateLessonNote({ ...formData, subStrandId: selections.subStrand }))
      .unwrap()
      .then(() => handleCloseModal())
      .catch(() => {});
  }, [dispatch, selections.subStrand]);

  // --- Delete Handlers ---
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
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">Teacher Dashboard</Typography>
        </Box>

        {/* ✅ 2. WRAP MAIN CONTENT IN A BOX WITH Z-INDEX TO FIX CLICK ISSUE */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Note Generator Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
            <Typography variant="h6" gutterBottom>Select Topic to Generate Note</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Level', name: 'level', items: levels },
                { label: 'Class', name: 'class', items: classes, disabled: !selections.level },
                { label: 'Subject', name: 'subject', items: subjects, disabled: !selections.class },
                { label: 'Strand', name: 'strand', items: strands, disabled: !selections.subject },
              ].map(({ label, name, items, disabled }) => (
                <Grid item xs={12} sm={6} md={3} key={name}>
                  <FormControl fullWidth disabled={disabled || false}>
                    <InputLabel>{label}</InputLabel>
                    <Select name={name} value={selections[name]} label={label} onChange={handleSelectionChange}>
                      {(items || []).map((i) => (
                        <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
              <Grid item xs={12}>
                <FormControl fullWidth disabled={!selections.strand}>
                  <InputLabel>Sub-Strand</InputLabel>
                  <Select name="subStrand" value={selections.subStrand} label="Sub-Strand" onChange={handleSelectionChange}>
                    {(subStrands || []).map((s) => (
                      <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              onClick={handleOpenModal}
              // ✅ 1. (Continued) COMBINE LOADING STATES FOR ROBUSTNESS
              disabled={!selections.subStrand || teacherLoading || curriculumLoading}
              sx={{ mt: 2 }}
            >
              Generate AI Lesson Note
            </Button>
          </Paper>

          {/* Lesson Notes List */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>My Generated Lesson Notes</Typography>
            {teacherLoading && lessonNotes.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
            ) : (
              <List>
                {lessonNotes.map((note) => (
                  <ListItem key={note._id} disablePadding secondaryAction={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(note._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    }>
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
        </Box>

        {/* Modals and Snackbars remain outside the z-indexed Box */}
        <LessonNoteForm
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleGenerateNote}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          isLoading={teacherLoading}
        />

        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this lesson note? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
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