import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, reset as resetCurriculum } from '../features/curriculum/curriculumSlice';
import { getLearnerNotes, getQuizzes, getResources } from '../features/student/studentSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { 
  Box, Typography, Container, Button, Grid, Select, MenuItem, 
  FormControl, InputLabel, Paper, List, ListItem, ListItemText, ListItemIcon, 
  Card, CardContent, CircularProgress 
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { notes, quizzes, resources, isLoading } = useSelector((state) => state.student);
  
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });

  // Redirect non-students to their respective dashboards
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'teacher' || user.role === 'school_admin') navigate('/teacher/dashboard');
  }, [user, navigate]);

  // Fetch initial top-level items (levels) for students
  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(fetchItems('levels'));
    }
    // Cleanup on unmount
    return () => {
        dispatch(resetCurriculum());
    }
  }, [dispatch, user]);

  // Chain useEffects to fetch data on-demand
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

  // Fetch content when the final selection (subStrand) is made
  useEffect(() => {
    if (selections.subStrand) {
      dispatch(getLearnerNotes(selections.subStrand));
      dispatch(getQuizzes(selections.subStrand));
      dispatch(getResources(selections.subStrand));
    }
  }, [selections.subStrand, dispatch]);

  const handleSelectionChange = (e) => {
    const { name, value } = e.target;
    const newSelections = { ...selections, [name]: value };

    // Reset child selections when a parent value changes
    if (name === 'level') { newSelections.class = ''; newSelections.subject = ''; newSelections.strand = ''; newSelections.subStrand = ''; }
    if (name === 'class') { newSelections.subject = ''; newSelections.strand = ''; newSelections.subStrand = ''; }
    if (name === 'subject') { newSelections.strand = ''; newSelections.subStrand = ''; }
    if (name === 'strand') { newSelections.subStrand = ''; }

    setSelections(newSelections);
  };

  const handleDownloadPdf = (noteId, noteTopic) => {
    const input = document.getElementById(`note-content-${noteId}`);
    if (!input) return;
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
        const imgX = (pdfWidth - canvasWidth * ratio) / 2;
        const imgY = 15;
        pdf.addImage(imgData, 'PNG', imgX, imgY, canvasWidth * ratio, canvasHeight * ratio);
        pdf.save(`${noteTopic || 'note'}.pdf`);
      });
  };
  
  // Render loading or nothing if not a student
  if (!user || user.role !== 'student') {
    return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  }

  // --- STUDENT DASHBOARD ---
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container>
        <Box textAlign="center" my={5}>
            <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: '600'}}>
              Welcome, {user.fullName}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Browse your curriculum to find learning materials.
            </Typography>
        </Box>
        
        <Paper elevation={3} sx={{padding: 3, mb: 5}}>
          <Typography variant="h6" gutterBottom>Filter Your Topics</Typography>
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
                    <Typography variant="h5" gutterBottom>Notes</Typography>
                    {notes.length > 0 ? notes.map(note => (
                      <Box key={note._id} sx={{mb: 2}}>
                        <Box id={`note-content-${note._id}`} sx={{ mb: 1, p: 2, border: '1px solid #eee', borderRadius: 1 }} dangerouslySetInnerHTML={{ __html: note.content }}></Box>
                        <Button onClick={() => handleDownloadPdf(note._id, "note")} size="small">Download as PDF</Button>
                      </Box>
                    )) : <Typography color="text.secondary">No notes found for this topic.</Typography>}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{p: 3, mb: 3}}>
                    <Typography variant="h5" gutterBottom>Quizzes</Typography>
                    {quizzes.length > 0 ? (
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {quizzes.map(quiz => <Button key={quiz._id} component={RouterLink} to={`/quiz/${quiz._id}`} variant="contained">{quiz.title}</Button>)}
                      </Box>
                    ) : <Typography color="text.secondary">No quizzes found for this topic.</Typography>}
                  </Paper>
                  <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                    <Typography variant="h5" gutterBottom>Resources</Typography>
                    {resources.length > 0 ? (
                      <List>{resources.map(res => (
                        <ListItem key={res._id} component="a" href={`/${res.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
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