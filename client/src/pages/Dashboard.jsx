import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLevels, getClasses, getSubjects, getStrands, getSubStrands } from '../features/curriculum/curriculumSlice';
import { getLearnerNotes, getQuizzes, getResources, logNoteView } from '../features/student/studentSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- MUI Imports ---
import { 
  Box, Typography, Container, Button, Link, Grid, Select, MenuItem, 
  FormControl, InputLabel, Paper, List, ListItem, ListItemText, ListItemIcon, 
  Card, CardActionArea, CardContent, CircularProgress 
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AttachFileIcon from '@mui/icons-material/AttachFile';

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { notes, quizzes, resources, isLoading } = useSelector((state) => state.student);
  
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selections, setSelections] = useState({ class: '', subject: '', strand: '', subStrand: '' });

  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(getLevels());
      dispatch(getClasses());
      dispatch(getSubjects());
      dispatch(getStrands());
      dispatch(getSubStrands());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (selections.subStrand) {
      dispatch(getLearnerNotes(selections.subStrand))
        .then((action) => {
          if (getLearnerNotes.fulfilled.match(action)) {
            action.payload.forEach(note => {
              dispatch(logNoteView(note._id));
            });
          }
        });
      dispatch(getQuizzes(selections.subStrand));
      dispatch(getResources(selections.subStrand));
    }
  }, [selections.subStrand, dispatch]);

  const handleLevelSelect = (levelId) => {
    setSelectedLevelId(levelId);
    setSelections({ class: '', subject: '', strand: '', subStrand: '' }); // Reset lower-level selections
  };

  const handleSelectionChange = (e) => {
    const { name, value } = e.target;
    setSelections(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadPdf = (noteId, noteTopic) => {
    const input = document.getElementById(`note-content-${noteId}`);
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

  const filteredClasses = classes.filter(c => c.level?._id === selectedLevelId);
  const filteredSubjects = subjects.filter(s => s.class?._id === selections.class);
  const filteredStrands = strands.filter(s => s.subject?._id === selections.subject);
  const filteredSubStrands = subStrands.filter(s => s.strand?._id === selections.strand);

  if (user?.role === 'admin' || user?.role === 'teacher') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Container>
          <Box textAlign="center" my={5}>
            <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: '600'}}>
              Welcome, {user.fullName}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Use the links below to access your tools.
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" gap={2}>
            {user.role === 'admin' && <Button component={RouterLink} to="/admin" variant="contained" size="large">Admin Dashboard</Button>}
            {user.role === 'teacher' && <Button component={RouterLink} to="/teacher/dashboard" variant="contained" size="large">Teacher Tools</Button>}
          </Box>
        </Container>
      </motion.div>
    );
  }

  // --- STUDENT DASHBOARD ---
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container>
        <Box textAlign="center" my={5}>
            <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: '600'}}>
              Welcome, {user && user.fullName}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Select your academic level to begin.
            </Typography>
        </Box>
        
        <Grid container spacing={3} justifyContent="center" sx={{mb: 5}}>
          {levels.map(level => (
            <Grid item key={level._id} xs={12} sm={6} md={4}>
              <Card 
                elevation={selectedLevelId === level._id ? 8 : 2} 
                sx={{ border: selectedLevelId === level._id ? 2 : 0, borderColor: 'primary.main', transition: 'all 0.2s ease-in-out' }}
              >
                <CardActionArea onClick={() => handleLevelSelect(level._id)}>
                  <CardContent sx={{textAlign: 'center', p: 4}}>
                    <SchoolIcon color="primary" sx={{fontSize: 40, mb: 1}}/>
                    <Typography variant="h5" component="div">{level.name}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selectedLevelId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Paper elevation={3} sx={{padding: 3, mb: 5}}>
              <Typography variant="h6" gutterBottom>Browse Topics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel id="class-select-label">Class</InputLabel><Select labelId="class-select-label" name="class" value={selections.class} label="Class" onChange={handleSelectionChange}>{filteredClasses.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={4}><FormControl fullWidth disabled={!selections.class}><InputLabel id="subject-select-label">Subject</InputLabel><Select labelId="subject-select-label" name="subject" value={selections.subject} label="Subject" onChange={handleSelectionChange}>{filteredSubjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} sm={4}><FormControl fullWidth disabled={!selections.subject}><InputLabel id="strand-select-label">Strand</InputLabel><Select labelId="strand-select-label" name="strand" value={selections.strand} label="Strand" onChange={handleSelectionChange}>{filteredStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12}><FormControl fullWidth disabled={!selections.strand}><InputLabel id="subStrand-select-label">Sub-Strand</InputLabel><Select labelId="subStrand-select-label" name="subStrand" value={selections.subStrand} label="Sub-Strand" onChange={handleSelectionChange}>{filteredSubStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
              </Grid>
            </Paper>
          </motion.div>
        )}

        {isLoading && selections.subStrand && <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box>}
        {selections.subStrand && !isLoading && (
          <Box mt={4}>
            <Paper elevation={2} sx={{p: 3, mb: 3}}>
              <Typography variant="h5" gutterBottom>Notes</Typography>
              {notes.length > 0 ? notes.map(note => (
                <Box key={note._id} sx={{mb: 2}}>
                  <Box id={`note-content-${note._id}`} dangerouslySetInnerHTML={{ __html: note.content }}></Box>
                  <Button onClick={() => handleDownloadPdf(note._id, "note")} size="small" sx={{mt: 1}}>Download as PDF</Button>
                </Box>
              )) : <Typography color="text.secondary">No notes for this topic yet.</Typography>}
            </Paper>
            <Paper elevation={2} sx={{p: 3, mb: 3}}>
              <Typography variant="h5" gutterBottom>Quizzes</Typography>
              {quizzes.length > 0 ? (
                <Box display="flex" gap={1} flexWrap="wrap">
                  {quizzes.map(quiz => <Button key={quiz._id} component={RouterLink} to={`/quiz/${quiz._id}`} variant="contained">{quiz.title}</Button>)}
                </Box>
              ) : <Typography color="text.secondary">No quizzes for this topic yet.</Typography>}
            </Paper>
            <Paper elevation={2} sx={{p: 3}}>
              <Typography variant="h5" gutterBottom>Resources</Typography>
              {resources.length > 0 ? (
                <List>{resources.map(res => (
                  <ListItem key={res._id} component="a" href={`http://localhost:5000/${res.filePath.replace(/\\/g, '/')}`} target="_blank">
                    <ListItemIcon><AttachFileIcon /></ListItemIcon>
                    <ListItemText primary={res.fileName} />
                  </ListItem>
                ))}</List>
              ) : <Typography color="text.secondary">No resources for this topic yet.</Typography>}
            </Paper>
          </Box>
        )}
      </Container>
    </motion.div>
  );
}

export default Dashboard;