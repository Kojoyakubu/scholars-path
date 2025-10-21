import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// --- Redux Imports ---
import { fetchItems, fetchChildren, clearChildren } from '../features/curriculum/curriculumSlice';
import {
  generateLessonNote,
  getMyLessonNotes,
  deleteLessonNote,
  generateLearnerNote,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote as deleteDraftLearnerNote, // Rename to avoid conflict
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
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { lessonNotes, draftLearnerNotes, isLoading, isError, message } = useSelector((state) => state.teacher);

  // --- State Management ---
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generatingNoteId, setGeneratingNoteId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null); // For previewing drafts

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes()); // Fetch draft notes on component mount
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      setSnackbar({ open: true, message, severity: isError ? 'error' : 'success' });
    }
    return () => { if (message) dispatch(resetTeacherState()); };
  }, [message, isError, dispatch]);

  // Effects for chained dropdowns
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
  
  const handleGenerateLearnerNote = useCallback((lessonNoteId) => {
    setGeneratingNoteId(lessonNoteId);
    dispatch(generateLearnerNote(lessonNoteId))
      .unwrap().catch(() => {}).finally(() => setGeneratingNoteId(null));
  }, [dispatch]);

  const handlePublish = useCallback((noteId) => {
    dispatch(publishLearnerNote(noteId));
  }, [dispatch]);

  const handleDeleteDraft = useCallback((noteId) => {
    dispatch(deleteDraftLearnerNote(noteId));
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
        
        {/* Lesson Note Generator */}
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

        {/* My Generated Lesson Notes */}
        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <Typography variant="h5" gutterBottom>My Generated Lesson Notes</Typography>
          {isLoading && lessonNotes.length === 0 ? (<Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>) : (
            <List>
              {lessonNotes.map((note) => (
                <ListItem key={note._id} disablePadding secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Generate Learner's Version">
                      <IconButton onClick={() => handleGenerateLearnerNote(note._id)} disabled={generatingNoteId === note._id}>
                        {generatingNoteId === note._id ? <CircularProgress size={24} /> : <FaceRetouchingNaturalIcon color="primary" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Note">
                      <IconButton onClick={() => setNoteToDelete(note._id)}><DeleteIcon color="error" /></IconButton>
                    </Tooltip>
                  </Stack>
                }>
                  <ListItemButton component={RouterLink} to={`/teacher/notes/${note._id}`}>
                    <ArticleIcon sx={{ mr: 2, color: 'action.active' }} />
                    <ListItemText primary={`Note from ${new Date(note.createdAt).toLocaleDateString()}`} secondary={note.content.substring(0, 100) + '...'}/>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Draft Learner Notes */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Draft Learner Notes</Typography>
          <List>
            {isLoading && draftLearnerNotes.length === 0 ? <CircularProgress /> : (
              draftLearnerNotes.length > 0 ? draftLearnerNotes.map((note) => (
              <ListItem key={note._id} disablePadding secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Preview Note"><IconButton onClick={() => setViewingNote(note)}><VisibilityIcon color="action" /></IconButton></Tooltip>
                  <Tooltip title="Publish to Students"><IconButton onClick={() => handlePublish(note._id)}><CheckCircleIcon color="success" /></IconButton></Tooltip>
                  <Tooltip title="Delete Draft"><IconButton onClick={() => handleDeleteDraft(note._id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                </Stack>
              }>
                <ListItemText primary={`Draft for: ${note.subStrand?.name || 'N/A'}`} secondary={`Generated on ${new Date(note.createdAt).toLocaleDateString()}`}/>
              </ListItem>
            )) : (
              <Typography color="text.secondary" sx={{ p: 2 }}>No draft learner notes pending review.</Typography>
            ))}
          </List>
        </Paper>
        
        {/* Modals and Snackbars */}
        <LessonNoteForm open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleGenerateNote} subStrandName={subStrands.find(s => s._id === selections.subStrand)?.name || ''} isLoading={isLoading} />
        <Dialog open={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to permanently delete this lesson note?</DialogContentText></DialogContent>
          <DialogActions><Button onClick={() => setNoteToDelete(null)}>Cancel</Button><Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button></DialogActions>
        </Dialog>
        <Dialog open={!!viewingNote} onClose={() => setViewingNote(null)} fullWidth maxWidth="md">
          <DialogTitle>Preview Learner Note</DialogTitle>
          <DialogContent>
            <Box sx={{'& h2, & h3': {fontSize: '1.2em', fontWeight: 'bold'}, '& p': {fontSize: '1em'}}}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{viewingNote?.content || ''}</ReactMarkdown>
            </Box>
          </DialogContent>
          <DialogActions><Button onClick={() => setViewingNote(null)}>Close</Button></DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;