import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, clearChildren, resetCurriculumState } from '../features/curriculum/curriculumSlice';
import { getLearnerNotes, getQuizzes, getResources, logNoteView } from '../features/student/studentSlice';

// --- NEW, SIMPLER IMPORTS ---
import html2pdf from 'html2pdf.js';

import {
  Box, Typography, Container, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, List, ListItem, ListItemText, ListItemIcon, CircularProgress
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const curriculumState = useSelector((state) => state.curriculum);
  const studentState = useSelector((state) => state.student);
  
  const { levels, classes, subjects, strands, subStrands } = curriculumState;
  const { notes, quizzes, resources } = studentState;
  const isLoading = curriculumState.isLoading || studentState.isLoading;

  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });

  // (All useEffect and handler logic remains the same...)
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    if (user.role === 'teacher' || user.role === 'school_admin') navigate('/teacher/dashboard');
    if (user.role === 'student') {
        dispatch(fetchItems({ entity: 'levels' }));
    }
    return () => { dispatch(resetCurriculumState()); }
  }, [dispatch, user, navigate]);

  useEffect(() => { if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })) }, [selections.level, dispatch]);
  useEffect(() => { if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })) }, [selections.class, dispatch]);
  useEffect(() => { if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })) }, [selections.subject, dispatch]);
  useEffect(() => { if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })) }, [selections.strand, dispatch]);
  useEffect(() => {
    if (selections.subStrand) {
      dispatch(getLearnerNotes(selections.subStrand));
      dispatch(getQuizzes(selections.subStrand));
      dispatch(getResources(selections.subStrand));
    }
  }, [selections.subStrand, dispatch]);

  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections(prev => {
      const newSelections = { ...prev, [name]: value };
      const resetMap = {
        level: ['class', 'subject', 'strand', 'subStrand'],
        class: ['subject', 'strand', 'subStrand'],
        subject: ['strand', 'subStrand'],
        strand: ['subStrand']
      };
      if (resetMap[name]) {
        resetMap[name].forEach(key => newSelections[key] = '');
        dispatch(clearChildren({ entities: resetMap[name] }));
      }
      return newSelections;
    });
  }, [dispatch]);

  const handleNoteView = useCallback((noteId) => {
    dispatch(logNoteView(noteId));
  }, [dispatch]);

  // --- FINAL, CORRECTED PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = useCallback((noteId, noteTopic) => {
    handleNoteView(noteId);
    const element = document.getElementById(`note-content-${noteId}`);
    if (!element) return;
    const filename = `${noteTopic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const opt = {
      margin: 10, filename, image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }, [handleNoteView]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        {/* ... (Rest of the JSX is unchanged) ... */}
        <Box textAlign="center" my={5}><Typography variant="h4" component="h1">Welcome, {user?.fullName}!</Typography></Box>
        <Paper elevation={3} sx={{p: 3, mb: 5}}>
          {/* ... (Curriculum selection Grid) ... */}
        </Paper>
        {selections.subStrand && (
          isLoading ? <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box> : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                    <Typography variant="h5" gutterBottom>Lesson Notes</Typography>
                    {notes.length > 0 ? notes.map(note => (
                      <Paper key={note._id} variant="outlined" sx={{mb: 2, p: 2}}>
                        <div onClick={() => handleNoteView(note._id)}><div id={`note-content-${note._id}`} dangerouslySetInnerHTML={{ __html: note.content }} /></div>
                        <Button startIcon={<DownloadIcon />} onClick={() => handleDownloadPdf(note._id, "note")} size="small" sx={{mt: 1}}>Download PDF</Button>
                      </Paper>
                    )) : <Typography color="text.secondary">No notes found.</Typography>}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  {/* ... (Quizzes and Resources sections) ... */}
                </Grid>
              </Grid>
            </motion.div>
          )
        )}
      </Container>
    </motion.div>
  );
}

export default Dashboard;