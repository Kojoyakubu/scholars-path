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
  generateAiQuiz,
  getTeacherAnalytics, // ✅ 1. Import the analytics action
} from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import AiQuizForm from '../components/AiQuizForm';

// MUI Imports
import {
  Box, Typography, Container, Button, Grid, Select, MenuItem, FormControl,
  InputLabel, Paper, List, ListItem, ListItemText, ListItemButton, CircularProgress,
  Stack, IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Snackbar, Alert, Tooltip, Card, CardHeader, CardContent, Divider
} from '@mui/material';
import {
  Article, Delete, FaceRetouchingNatural, CheckCircle, Visibility, AddCircle, Quiz,
  BarChart, Preview, Assessment // ✅ 2. Import icons for analytics
} from '@mui/icons-material';

// --- Reusable Sub-Components ---
const SectionCard = ({ title, icon, children }) => (
  <Card component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} sx={{ height: '100%' }}>
    <CardHeader
      avatar={icon}
      title={title}
      titleTypographyProps={{ variant: 'h6' }}
    />
    <CardContent>{children}</CardContent>
  </Card>
);

// ✅ 3. Reusable Stat Card component
const StatCard = ({ title, value, icon }) => (
  <Grid item xs={12} sm={4}>
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
      {icon}
      <Box sx={{ ml: 2 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  </Grid>
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
  // ✅ 4. Get analytics and loading state
  const { lessonNotes, draftLearnerNotes, analytics, isLoading, isError, message } = useSelector((state) => state.teacher);

  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generatingNoteId, setGeneratingNoteId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  useEffect(() => {
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(fetchItems({ entity: 'subjects' }));
    dispatch(fetchItems({ entity: 'classes' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
    dispatch(getTeacherAnalytics()); // ✅ 5. Call the action on load
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
    dispatch(generateLessonNote(formData)).unwrap().then(() => setIsNoteModalOpen(false)).catch(() => {});
  }, [dispatch]);

  const handleGenerateAiQuizSubmit = useCallback((formData) => {
    dispatch(generateAiQuiz(formData)).unwrap().then(() => setIsAiQuizModalOpen(false)).catch(() => {});
  }, [dispatch]);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" gutterBottom>Teacher Dashboard</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back! Here are your tools and performance insights.
        </Typography>
      </motion.div>

      {/* ✅ 6. Analytics Insights Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>Analytics & Insights</Typography>
        <Grid container spacing={3}>
          {isLoading && !analytics.totalNoteViews ? <CircularProgress sx={{ml: 3, mt: 2}} /> : (
            <>
              <StatCard title="Total Note Views" value={analytics.totalNoteViews ?? 0} icon={<Preview color="primary" sx={{ fontSize: 40 }} />} />
              <StatCard title="Total Quiz Attempts" value={analytics.totalQuizAttempts ?? 0} icon={<Assessment color="secondary" sx={{ fontSize: 40 }} />} />
              <StatCard title="Average Quiz Score" value={`${Math.round(analytics.averageScore ?? 0)}%`} icon={<BarChart color="success" sx={{ fontSize: 40 }} />} />
            </>
          )}
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <SectionCard title="Content Generators" icon={<AddCircle color="primary" />}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" component="h3">Lesson Note Generator</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select a topic from the curriculum to generate a new AI-powered lesson note.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>{renderDropdown('level', 'Level', selections.level, levels, handleSelectionChange)}</Grid>
                  <Grid item xs={12} sm={6}>{renderDropdown('class', 'Class', selections.class, classes, handleSelectionChange, !selections.level)}</Grid>
                  <Grid item xs={12} sm={6}>{renderDropdown('subject', 'Subject', selections.subject, subjects, handleSelectionChange, !selections.class)}</Grid>
                  <Grid item xs={12} sm={6}>{renderDropdown('strand', 'Strand', selections.strand, strands, handleSelectionChange, !selections.subject)}</Grid>
                  <Grid item xs={12}>{renderDropdown('subStrand', 'Sub-Strand', selections.subStrand, subStrands, handleSelectionChange, !selections.strand)}</Grid>
                </Grid>
                <Button variant="contained" onClick={() => setIsNoteModalOpen(true)} disabled={!selections.subStrand || isLoading} sx={{ mt: 2 }}>
                  Generate Lesson Note
                </Button>
              </Box>
              <Divider />
              <Box>
                <Typography variant="h6" component="h3">Quiz Generator</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Automatically create a WAEC-standard quiz on a subject of your choice.
                </Typography>
                <Stack spacing={2} direction="row">
                  <Button variant="contained" onClick={() => setIsAiQuizModalOpen(true)} startIcon={<Quiz />}>
                    Generate with AI
                  </Button>
                  <Button variant="outlined" disabled>Create Manually (Soon)</Button>
                </Stack>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Stack spacing={4}>
            <SectionCard title="My Generated Lesson Notes" icon={<Article color="action" />}>
              {isLoading && !lessonNotes.length ? <CircularProgress /> : (
                <List disablePadding>
                  {lessonNotes.length > 0 ? lessonNotes.map(note => (
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
                        <ListItemText primary={`Note for ${note.subStrand?.name || '...'}`} secondary={`Created on ${new Date(note.createdAt).toLocaleDateString()}`} />
                      </ListItemButton>
                    </ListItem>
                  )) : <Typography color="text.secondary">You haven't generated any lesson notes yet.</Typography>}
                </List>
              )}
            </SectionCard>

            <SectionCard title="Draft Learner Notes (For Review)" icon={<Visibility color="action" />}>
              {isLoading && !draftLearnerNotes.length ? <CircularProgress /> : (
                <List disablePadding>
                  {draftLearnerNotes.length > 0 ? draftLearnerNotes.map(note => (
                    <ListItem key={note._id} disablePadding secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Preview"><IconButton onClick={() => setViewingNote(note)}><Visibility /></IconButton></Tooltip>
                        <Tooltip title="Publish to Students"><IconButton onClick={() => dispatch(publishLearnerNote(note._id))}><CheckCircle color="success" /></IconButton></Tooltip>
                        <Tooltip title="Delete Draft"><IconButton onClick={() => dispatch(deleteDraftLearnerNote(note._id))}><Delete color="error" /></IconButton></Tooltip>
                      </Stack>
                    }>
                      <ListItemText primary={`Draft for: ${note.subStrand?.name || 'N/A'}`} secondary={`Generated on ${new Date(note.createdAt).toLocaleDateString()}`} />
                    </ListItem>
                  )) : <Typography color="text.secondary">No draft learner notes pending review.</Typography>}
                </List>
              )}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
      
      {/* --- Modals & Snackbars --- */}
      <LessonNoteForm open={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSubmit={(data) => handleGenerateNoteSubmit({ ...data, subStrandId: selections.subStrand })} subStrandName={subStrands.find(s => s._id === selections.subStrand)?.name || ''} isLoading={isLoading} />
      <AiQuizForm open={isAiQuizModalOpen} onClose={() => setIsAiQuizModalOpen(false)} onSubmit={handleGenerateAiQuizSubmit} isLoading={isLoading} curriculum={{ subjects, classes }} />
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