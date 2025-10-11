import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, clearChildren, resetCurriculumState } from '../features/curriculum/curriculumSlice';
import { getLearnerNotes, getQuizzes, getResources, logNoteView } from '../features/student/studentSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  Box, Typography, Container, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, List, ListItem, ListItemText, ListItemIcon, CircularProgress
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
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

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    if (user.role === 'teacher' || user.role === 'school_admin') navigate('/teacher/dashboard');
    if (user.role === 'student') {
        dispatch(fetchItems({ entity: 'levels' }));
    }
    return () => {
      // Dispatch the correctly named reset action on unmount
      dispatch(resetCurriculumState());
    }
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

  const handleDownloadPdf = useCallback((noteId, noteTopic) => {
    handleNoteView(noteId); // Log view on download
    const input = document.getElementById(`note-content-${noteId}`);
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${noteTopic || 'note'}.pdf`);
    });
  }, [handleNoteView]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom>Welcome, {user?.fullName}!</Typography>
          <Typography variant="h6" color="text.secondary">Select your topics to find learning materials.</Typography>
        </Box>
        <Paper elevation={3} sx={{padding: 3, mb: 5}}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Level</InputLabel><Select name="level" value={selections.level} label="Level" onChange={handleSelectionChange}>{levels.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.level}><InputLabel>Class</InputLabel><Select name="class" value={selections.class} label="Class" onChange={handleSelectionChange}>{classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.class}><InputLabel>Subject</InputLabel><Select name="subject" value={selections.subject} label="Subject" onChange={handleSelectionChange}>{subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.subject}><InputLabel>Strand</InputLabel><Select name="strand" value={selections.strand} label="Strand" onChange={handleSelectionChange}>{strands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12}><FormControl fullWidth disabled={!selections.strand}><InputLabel>Sub-Strand</InputLabel><Select name="subStrand" value={selections.subStrand} label="Sub-Strand" onChange={handleSelectionChange}>{subStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
          </Grid>
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
                  <Paper elevation={2} sx={{p: 3, mb: 3}}>
                    <Typography variant="h5" gutterBottom>Quizzes</Typography>
                    {quizzes.length > 0 ? (
                      <Box display="flex" gap={1.5} flexWrap="wrap">
                        {quizzes.map(quiz => <Button key={quiz._id} component={RouterLink} to={`/quiz/${quiz._id}`} variant="contained" startIcon={<QuizIcon/>}>{quiz.title}</Button>)}
                      </Box>
                    ) : <Typography color="text.secondary">No quizzes found.</Typography>}
                  </Paper>
                  <Paper elevation={2} sx={{p: 3}}>
                    <Typography variant="h5" gutterBottom>Resources</Typography>
                    {resources.length > 0 ? (
                      <List>{resources.map(res => (
                        <ListItem key={res._id} button component="a" href={`/${res.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                          <ListItemIcon><AttachFileIcon /></ListItemIcon>
                          <ListItemText primary={res.fileName} />
                        </ListItem>
                      ))}</List>
                    ) : <Typography color="text.secondary">No resources found.</Typography>}
                  </Paper>
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