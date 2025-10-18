import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Redux Imports ---
import {
  fetchItems,
  fetchChildren,
  clearChildren,
  resetCurriculumState,
} from '../features/curriculum/curriculumSlice';
import {
  getLearnerNotes,
  getQuizzes,
  getResources,
  logNoteView,
} from '../features/student/studentSlice';

// --- MUI Imports ---
import {
  Box, Typography, Container, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, List, ListItem, ListItemIcon,
  CircularProgress, Stack, ListItemText
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// --- Helper Import ---
import { downloadAsPdf, downloadAsWord } from '../utils/downloadHelper';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const curriculumState = useSelector((state) => state.curriculum);
  const studentState = useSelector((state) => state.student);

  const { levels, classes, subjects, strands, subStrands } = curriculumState;
  const { notes, quizzes, resources } = studentState;
  const isLoading = curriculumState.isLoading || studentState.isLoading;

  const [selections, setSelections] = useState({
    level: '', class: '', subject: '', strand: '', subStrand: '',
  });

  // Effect to redirect non-students and fetch initial data
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    if (user.role === 'teacher' || user.role === 'school_admin') navigate('/teacher/dashboard');
    if (user.role === 'student') {
      dispatch(fetchItems({ entity: 'levels' }));
    }
    return () => {
      dispatch(resetCurriculumState());
    };
  }, [dispatch, user, navigate]);

  // Effects to chain dropdown data fetching
  useEffect(() => {
    if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level }));
  }, [selections.level, dispatch]);

  useEffect(() => {
    if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class }));
  }, [selections.class, dispatch]);

  useEffect(() => {
    if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject }));
  }, [selections.subject, dispatch]);

  useEffect(() => {
    if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand }));
  }, [selections.strand, dispatch]);

  // Effect to fetch content when a sub-strand is selected
  useEffect(() => {
    if (selections.subStrand) {
      dispatch(getLearnerNotes(selections.subStrand));
      dispatch(getQuizzes(selections.subStrand));
      dispatch(getResources(selections.subStrand));
    }
  }, [selections.subStrand, dispatch]);

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

  // Centralized download handler
  const handleDownload = useCallback((type, noteId, noteTopic) => {
    dispatch(logNoteView(noteId)); // Log view on download
    const elementId = `note-content-${noteId}`;
    if (type === 'pdf') {
      downloadAsPdf(elementId, noteTopic);
    } else if (type === 'word') {
      downloadAsWord(elementId, noteTopic);
    }
  }, [dispatch]);

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
          <Typography variant="h4" component="h1" gutterBottom>Welcome, {user?.fullName}!</Typography>
          <Typography variant="h6" color="text.secondary">Select your topics to find learning materials.</Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('level', 'Level', selections.level, levels)}</Grid>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('class', 'Class', selections.class, classes, !selections.level)}</Grid>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('subject', 'Subject', selections.subject, subjects, !selections.class)}</Grid>
            <Grid item xs={12} sm={6} md={3}>{renderDropdown('strand', 'Strand', selections.strand, strands, !selections.subject)}</Grid>
            <Grid item xs={12}>{renderDropdown('subStrand', 'Sub-Strand', selections.subStrand, subStrands, !selections.strand)}</Grid>
          </Grid>
        </Paper>

        {selections.subStrand && (
          isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h5" gutterBottom>Lesson Notes</Typography>
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <Paper key={note._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                          <div id={`note-content-${note._id}`} dangerouslySetInnerHTML={{ __html: note.content }} />
                          <Stack direction="row" spacing={1} sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                            <Button startIcon={<PictureAsPdfIcon />} onClick={() => handleDownload('pdf', note._id, 'lesson_note')} size="small" variant="outlined">PDF</Button>
                            <Button startIcon={<DescriptionIcon />} onClick={() => handleDownload('word', note._id, 'lesson_note')} size="small" variant="outlined" color="secondary">Word</Button>
                          </Stack>
                        </Paper>
                      ))
                    ) : <Typography color="text.secondary">No notes found for this topic.</Typography>}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom>Quizzes</Typography>
                      {quizzes.length > 0 ? (
                        <Box display="flex" gap={1.5} flexWrap="wrap">
                          {quizzes.map((quiz) => (
                            <Button key={quiz._id} component={RouterLink} to={`/quiz/${quiz._id}`} variant="contained" startIcon={<QuizIcon />}>{quiz.title}</Button>
                          ))}
                        </Box>
                      ) : <Typography color="text.secondary">No quizzes found for this topic.</Typography>}
                    </Paper>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom>Resources</Typography>
                      {resources.length > 0 ? (
                        <List>
                          {resources.map((res) => (
                            <ListItem key={res._id} button component="a" href={`/${res.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                              <ListItemIcon><AttachFileIcon /></ListItemIcon>
                              <ListItemText primary={res.fileName} />
                            </ListItem>
                          ))}
                        </List>
                      ) : <Typography color="text.secondary">No resources found for this topic.</Typography>}
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </motion.div>
          ))}
      </Container>
    </motion.div>
  );
}

export default Dashboard;