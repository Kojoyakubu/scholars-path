import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Redux & Components
import { fetchItems, fetchChildren, clearChildren } from '../features/curriculum/curriculumSlice';
import {
  generateLessonNote, getMyLessonNotes, deleteLessonNote,
  generateLearnerNote, getDraftLearnerNotes, publishLearnerNote,
  deleteLearnerNote as deleteDraftLearnerNote, resetTeacherState,
} from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';

// MUI Imports
import {
  Box, Typography, Container, Button, Grid, Select, MenuItem, FormControl,
  InputLabel, Paper, List, ListItem, ListItemText, ListItemButton, CircularProgress,
  Stack, IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Snackbar, Alert, Tooltip, Card, CardHeader, CardContent
} from '@mui/material';
// ✅ THE FIX IS HERE: All icons, including 'Article', are now imported.
import {
  Article,
  Delete,
  FaceRetouchingNatural,
  CheckCircle,
  Visibility,
  AddCircle
} from '@mui/icons-material';

// --- Reusable Sub-Components ---
const SectionCard = ({ title, children }) => (
  <Card component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
    <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
    <CardContent>{children}</CardContent>
  </Card>
);

const renderDropdown = (name, label, value, items, onChange, disabled = false) => (
  <FormControl fullWidth disabled={disabled}>
    <InputLabel>{label}</InputLabel>
    <Select name={name} value={value} label={label} onChange={onChange}>
      {items.map((item) => (<MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>))}
    </Select>
  </FormControl>
);

// --- Main Component ---
function TeacherDashboard() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { lessonNotes, draftLearnerNotes, isLoading, isError, message } = useSelector((state) => state.teacher);

  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generatingNoteId, setGeneratingNoteId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  useEffect(() => {
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      setSnackbar({ open: true, message, severity: isError ? 'error' : 'success' });
      dispatch(resetTeacherState());
    }
  }, [message, isError, dispatch]);

  useEffect(() => { if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })); }, [selections.level, dispatch]);
  useEffect(() => { if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })); }, [selections.class, dispatch]);
  useEffect(() => { if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })); }, [selections.subject, dispatch]);
  useEffect(() => { if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })); }, [selections.strand, dispatch]);

  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections(prev => {
      const newSelections = { ...prev, [name]: value };
      const resetMap = {
        level: ['class', 'subject', 'strand', 'subStrand'], class: ['subject', 'strand', 'subStrand'],
        subject: ['strand', 'subStrand'], strand: ['subStrand'],
      };
      if (resetMap[name]) {
        resetMap[name].forEach(key => newSelections[key] = '');
        dispatch(clearChildren({ entities: resetMap[name] }));
      }
      return newSelections;
    });
  }, [dispatch]);

  const handleGenerateNoteSubmit = useCallback((formData) => {
      dispatch(generateLessonNote(formData))
          .unwrap()
          .then(() => setIsModalOpen(false))
          .catch(() => {});
  }, [dispatch]);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" gutterBottom>Teacher Dashboard</Typography>
      </motion.div>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <SectionCard title="Lesson Note Generator">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a topic from the curriculum to generate a new AI-powered lesson note.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>{renderDropdown('level', 'Level', selections.level, levels, handleSelectionChange)}</Grid>
              <Grid item xs={12} sm={6} md={3}>{renderDropdown('class', 'Class', selections.class, classes, handleSelectionChange, !selections.level)}</Grid>
              <Grid item xs={12} sm={6} md={3}>{renderDropdown('subject', 'Subject', selections.subject, subjects, handleSelectionChange, !selections.class)}</Grid>
              <Grid item xs={12} sm={6} md={3}>{renderDropdown('strand', 'Strand', selections.strand, strands, handleSelectionChange, !selections.subject)}</Grid>
              <Grid item xs={12}>{renderDropdown('subStrand', 'Sub-Strand', selections.subStrand, subStrands, handleSelectionChange, !selections.strand)}</Grid>
            </Grid>
            <Button
              variant="contained"
              onClick={() => setIsModalOpen(true)}
              disabled={!selections.subStrand || isLoading}
              startIcon={<AddCircle />}
              sx={{ mt: 2 }}
            >
              Generate AI Lesson Note
            </Button>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard title="My Generated Lesson Notes">
            {isLoading && !lessonNotes.length ? <CircularProgress /> : (
              <List disablePadding>
                {lessonNotes.map(note => (
                  <ListItem key={note._id} disablePadding secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Generate Learner's Version"><IconButton onClick={() => {
                          setGeneratingNoteId(note._id);
                          dispatch(generateLearnerNote(note._id)).finally(() => setGeneratingNoteId(null));
                      }} disabled={generatingNoteId === note._id}>
                        {generatingNoteId === note._id ? <CircularProgress size={22} /> : <FaceRetouchingNatural color="primary" />}
                      </IconButton></Tooltip>
                      <Tooltip title="Delete Note"><IconButton onClick={() => setNoteToDelete(note)}><Delete color="error" /></IconButton></Tooltip>
                    </Stack>
                  }>
                    <ListItemButton component={RouterLink} to={`/teacher/notes/${note._id}`}>
                      <Article sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={`Note from ${new Date(note.createdAt).toLocaleDateString()}`} secondary={note.content.substring(0, 80) + '...'} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard title="Draft Learner Notes (For Review)">
            {isLoading && !draftLearnerNotes.length ? <CircularProgress /> : (
              <List disablePadding>
                {draftLearnerNotes.map(note => (
                  <ListItem key={note._id} disablePadding secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Preview"><IconButton onClick={() => setViewingNote(note)}><Visibility color="action" /></IconButton></Tooltip>
                      <Tooltip title="Publish to Students"><IconButton onClick={() => dispatch(publishLearnerNote(note._id))}><CheckCircle color="success" /></IconButton></Tooltip>
                      <Tooltip title="Delete Draft"><IconButton onClick={() => dispatch(deleteDraftLearnerNote(note._id))}><Delete color="error" /></IconButton></Tooltip>
                    </Stack>
                  }>
                    <ListItemText primary={`Draft for: ${note.subStrand?.name || 'N/A'}`} secondary={`Generated on ${new Date(note.createdAt).toLocaleDateString()}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>
      
      {/* --- Modals & Snackbars --- */}
      <LessonNoteForm open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={(data) => handleGenerateNoteSubmit({ ...data, subStrandId: selections.subStrand })} subStrandName={subStrands.find(s => s._id === selections.subStrand)?.name || ''} isLoading={isLoading} />
      <Dialog open={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to permanently delete this lesson note?</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setNoteToDelete(null)}>Cancel</Button><Button onClick={() => {
            dispatch(deleteLessonNote(noteToDelete._id));
            setNoteToDelete(null);
        }} color="error">Delete</Button></DialogActions>
      </Dialog>
      <Dialog open={!!viewingNote} onClose={() => setViewingNote(null)} fullWidth maxWidth="md">
        <DialogTitle>Preview Learner Note</DialogTitle>
        <DialogContent><Box sx={{ '& h2, & h3': { fontSize: '1.2em', fontWeight: 'bold' }, '& p': { fontSize: '1em' } }}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{viewingNote?.content || ''}</ReactMarkdown>
        </Box></DialogContent>
        <DialogActions><Button onClick={() => setViewingNote(null)}>Close</Button></DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default TeacherDashboard; 