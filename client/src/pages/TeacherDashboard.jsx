import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, clearChildren } from '../features/curriculum/curriculumSlice';
// THE FIX IS HERE: Import the correctly named reset action
import { generateLessonNote, getMyLessonNotes, resetTeacherState } from '../features/teacher/teacherSlice'; 
import LessonNoteForm from '../components/LessonNoteForm'; // Assuming this component exists

import {
  Box, Typography, Container, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, List, ListItem, ListItemText, CircularProgress
} from '@mui/material';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { lessonNotes, isLoading: isTeacherLoading } = useSelector((state) => state.teacher);

  // State for curriculum selection and the lesson note modal
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    dispatch(getMyLessonNotes());
    dispatch(fetchItems({ entity: 'levels' }));

    // Cleanup when the component unmounts
    return () => {
      // THE FIX IS HERE: Dispatch the correctly named reset action
      dispatch(resetTeacherState());
    };
  }, [dispatch]);

  // Handle chained curriculum fetching...
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

  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections(prev => {
        const newSelections = { ...prev, [name]: value };
        if (name === 'level') {
            newSelections.class = ''; newSelections.subject = ''; newSelections.strand = ''; newSelections.subStrand = '';
            dispatch(clearChildren({ entities: ['classes', 'subjects', 'strands', 'subStrands'] }));
        }
        // ... add resets for other levels (class, subject, etc.)
        return newSelections;
    });
  }, [dispatch]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleGenerateNote = useCallback((formData) => {
    const noteData = { ...formData, subStrandId: selections.subStrand };
    dispatch(generateLessonNote(noteData)).then((result) => {
        if (!result.error) {
            handleCloseModal(); // Close modal on success
        }
    });
  }, [dispatch, selections.subStrand]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom>Teacher Dashboard</Typography>
          <Typography variant="h6" color="text.secondary">Content Creation & Management</Typography>
        </Box>
        
        {/* Curriculum Selection */}
        <Paper elevation={3} sx={{padding: 3, mb: 5}}>
          <Typography variant="h6" gutterBottom>Select Topic to Generate Note</Typography>
          <Grid container spacing={2}>
            {/* Dropdowns for curriculum */}
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Level</InputLabel><Select name="level" value={selections.level} onChange={handleSelectionChange}>{levels.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.level}><InputLabel>Class</InputLabel><Select name="class" value={selections.class} onChange={handleSelectionChange}>{classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.class}><InputLabel>Subject</InputLabel><Select name="subject" value={selections.subject} onChange={handleSelectionChange}>{subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.subject}><InputLabel>Strand</InputLabel><Select name="strand" value={selections.strand} onChange={handleSelectionChange}>{strands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12}><FormControl fullWidth disabled={!selections.strand}><InputLabel>Sub-Strand</InputLabel><Select name="subStrand" value={selections.subStrand} onChange={handleSelectionChange}>{subStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
          </Grid>
          <Button variant="contained" onClick={handleOpenModal} disabled={!selections.subStrand || isTeacherLoading} sx={{mt: 2}}>
            {isTeacherLoading ? 'Generating...' : 'Generate AI Lesson Note'}
          </Button>
        </Paper>

        {/* Display Lesson Notes */}
        <Paper elevation={3} sx={{p: 3}}>
            <Typography variant="h5" gutterBottom>My Lesson Notes</Typography>
            {isTeacherLoading && lessonNotes.length === 0 ? <CircularProgress /> :
                <List>
                    {lessonNotes.map(note => (
                        <ListItem key={note._id}><ListItemText primary={note.content.substring(0, 100) + '...'} secondary={`Topic ID: ${note.subStrand}`} /></ListItem>
                    ))}
                </List>
            }
        </Paper>

        {/* Lesson Note Modal */}
        <LessonNoteForm 
            open={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleGenerateNote}
            subStrandName={subStrands.find(s => s._id === selections.subStrand)?.name || ''}
            isLoading={isTeacherLoading}
        />
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;