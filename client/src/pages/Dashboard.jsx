import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, clearChildren } from '../features/curriculum/curriculumSlice';
import { getLearnerNotes, getQuizzes, getResources } from '../features/student/studentSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  Box, Typography, Container, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, List, ListItem, ListItemText, ListItemIcon, CircularProgress
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { notes, quizzes, resources, isLoading: studentDataIsLoading } = useSelector((state) => state.student);
  const curriculumIsLoading = useSelector((state) => state.curriculum.isLoading);

  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });

  // Redirect non-students
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    if (user.role === 'teacher' || user.role === 'school_admin') navigate('/teacher/dashboard');
  }, [user, navigate]);

  // Fetch initial curriculum data
  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(fetchItems({ entity: 'levels' }));
    }
  }, [dispatch, user]);

  // Handle chained fetching
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

  // Fetch content for the selected sub-strand
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
      // When a parent dropdown changes, reset all children selections and clear their data
      if (name === 'level') {
        newSelections.class = ''; newSelections.subject = ''; newSelections.strand = ''; newSelections.subStrand = '';
        dispatch(clearChildren({ entities: ['classes', 'subjects', 'strands', 'subStrands'] }));
      }
      if (name === 'class') {
        newSelections.subject = ''; newSelections.strand = ''; newSelections.subStrand = '';
        dispatch(clearChildren({ entities: ['subjects', 'strands', 'subStrands'] }));
      }
      if (name === 'subject') {
        newSelections.strand = ''; newSelections.subStrand = '';
        dispatch(clearChildren({ entities: ['strands', 'subStrands'] }));
      }
      if (name === 'strand') {
        newSelections.subStrand = '';
        dispatch(clearChildren({ entities: ['subStrands'] }));
      }
      return newSelections;
    });
  }, [dispatch]);

  const handleDownloadPdf = useCallback((noteId, noteTopic) => {
    const input = document.getElementById(`note-content-${noteId}`);
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = pdfWidth / canvasWidth;
      const pdfHeight = canvasHeight * ratio;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${noteTopic || 'note'}.pdf`);
    });
  }, []);

  if (!user || user.role !== 'student') {
    return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: '600'}}>Welcome, {user.fullName}!</Typography>
          <Typography variant="h6" color="text.secondary">Select your topics to find learning materials.</Typography>
        </Box>
        
        <Paper elevation={3} sx={{padding: 3, mb: 5}}>
          <Typography variant="h6" gutterBottom>Browse Curriculum</Typography>
          <Grid container spacing={2}>
            {/* Dropdowns for curriculum selection */}
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Level</InputLabel><Select name="level" value={selections.level} label="Level" onChange={handleSelectionChange}>{levels.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.level}><InputLabel>Class</InputLabel><Select name="class" value={selections.class} label="Class" onChange={handleSelectionChange}>{classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.class}><InputLabel>Subject</InputLabel><Select name="subject" value={selections.subject} label="Subject" onChange={handleSelectionChange}>{subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.subject}><InputLabel>Strand</InputLabel><Select name="strand" value={selections.strand} label="Strand" onChange={handleSelectionChange}>{strands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12}><FormControl fullWidth disabled={!selections.strand}><InputLabel>Sub-Strand</InputLabel><Select name="subStrand" value={selections.subStrand} label="Sub-Strand" onChange={handleSelectionChange}>{subStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
          </Grid>
        </Paper>

        {selections.subStrand && (
          (studentDataIsLoading || curriculumIsLoading) ? <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box> : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                    <Typography variant="h5" gutterBottom>Lesson Notes</Typography>
                    {notes.length > 0 ? notes.map(note => (
                      <Paper key={note._id} variant="outlined" sx={{mb: 2, p: 2}}>
                        <Box id={`note-content-${note._id}`} dangerouslySetInnerHTML={{ __html: note.content }} />
                        <Button startIcon={<DownloadIcon />} onClick={() => handleDownloadPdf(note._id, "note")} size="small" sx={{mt: 1}}>Download PDF</Button>
                      </Paper>
                    )) : <Typography color="text.secondary">No notes found for this topic.</Typography>}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{p: 3, mb: 3}}>
                    <Typography variant="h5" gutterBottom>Quizzes</Typography>
                    {quizzes.length > 0 ? (
                      <Box display="flex" gap={1.5} flexWrap="wrap">
                        {quizzes.map(quiz => <Button key={quiz._id} component={RouterLink} to={`/quiz/${quiz._id}`} variant="contained">{quiz.title}</Button>)}
                      </Box>
                    ) : <Typography color="text.secondary">No quizzes found for this topic.</Typography>}
                  </Paper>
                  <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                    <Typography variant="h5" gutterBottom>Resources</Typography>
                    {resources.length > 0 ? (
                      <List>{resources.map(res => (
                        <ListItem key={res._id} button component="a" href={`/${res.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                          <ListItemIcon><AttachFileIcon /></ListItemIcon>
                          <ListItemText primary={res.fileName} />
                        </ListItem>
                      ))}</List>
                    ) : <Typography color="text.secondary">No resources found for this topic.</Typography>}
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