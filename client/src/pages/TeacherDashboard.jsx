import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, reset as resetCurriculum } from '../features/curriculum/curriculumSlice';
import { generateLessonNote, reset as resetTeacher } from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';

import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Paper,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { isSuccess, isError, isLoading, message, lessonNotes } = useSelector((state) => state.teacher);
  
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchItems('levels'));
    return () => {
      dispatch(resetCurriculum());
      dispatch(resetTeacher());
    }
  }, [dispatch]);

  useEffect(() => { if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })); }, [dispatch, selections.level]);
  useEffect(() => { if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })); }, [dispatch, selections.class]);
  useEffect(() => { if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })); }, [dispatch, selections.subject]);
  useEffect(() => { if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })); }, [dispatch, selections.strand]);

  const handleSelectionChange = (e) => {
    const { name, value } = e.target;
    const newSelections = { ...selections, [name]: value };
    if (name === 'level') { newSelections.class = ''; newSelections.subject = ''; newSelections.strand = ''; newSelections.subStrand = ''; }
    if (name === 'class') { newSelections.subject = ''; newSelections.strand = ''; newSelections.subStrand = ''; }
    if (name === 'subject') { newSelections.strand = ''; newSelections.subStrand = ''; }
    if (name === 'strand') { newSelections.subStrand = ''; }
    setSelections(newSelections);
  };

  const handleNoteSubmit = (formData) => {
    const noteData = {
      ...formData,
      subStrandId: selections.subStrand,
    };
    dispatch(generateLessonNote(noteData));
  };
  
  const handleDownloadPdf = (noteId, noteTopic) => {
    const input = document.getElementById(`note-content-${noteId}`);
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
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
      pdf.save(`${noteTopic || 'lesson-note'}.pdf`);
    });
  };

  const selectedSubStrandName = subStrands.find(s => s._id === selections.subStrand)?.name || '';

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Container>
          <Box textAlign="center" my={5}>
              <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: '600'}}>Teacher Dashboard</Typography>
              <Typography variant="h6" color="text.secondary">Select a topic to begin creating content.</Typography>
          </Box>
          
          {isSuccess && message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(resetTeacher())}>{message}</Alert>}
          {isError && message && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(resetTeacher())}>{message}</Alert>}

          <Paper elevation={3} sx={{padding: 3, mb: 5}}>
            <Typography variant="h6" gutterBottom>Browse Curriculum</Typography>
            {/* THIS IS THE FULL, CORRECT CODE FOR THE GRID */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Level</InputLabel><Select name="level" value={selections.level} label="Level" onChange={handleSelectionChange}>{levels.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.level}><InputLabel>Class</InputLabel><Select name="class" value={selections.class} label="Class" onChange={handleSelectionChange}>{classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.class}><InputLabel>Subject</InputLabel><Select name="subject" value={selections.subject} label="Subject" onChange={handleSelectionChange}>{subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.subject}><InputLabel>Strand</InputLabel><Select name="strand" value={selections.strand} label="Strand" onChange={handleSelectionChange}>{strands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12}><FormControl fullWidth disabled={!selections.strand}><InputLabel>Sub-Strand</InputLabel><Select name="subStrand" value={selections.subStrand} label="Sub-Strand" onChange={handleSelectionChange}>{subStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
            </Grid>
          </Paper>

          {selections.subStrand && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Paper elevation={3} sx={{p: 3, textAlign: 'center', mb: 5}}>
                  <Typography variant="h5" gutterBottom>Content Creation</Typography>
                  <Typography color="text.secondary" sx={{mb: 3}}>Create content for: <strong>{selectedSubStrandName}</strong></Typography>
                  <Box display="flex" justifyContent="center" gap={2}>
                      <Button variant="contained" onClick={() => setNoteModalOpen(true)}>Create Lesson Note</Button>
                      <Button variant="outlined" disabled>Create Quiz</Button>
                      <Button variant="outlined" disabled>Upload Resource</Button>
                  </Box>
              </Paper>
            </motion.div>
          )}

          {isLoading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /><Typography sx={{ml: 2}}>Generating your lesson note with AI...</Typography></Box>}
          
          {lessonNotes.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>My Generated Notes</Typography>
              {lessonNotes.map((note) => (
                <Accordion key={note._id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Note created on {new Date(note.createdAt).toLocaleDateString()}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box id={`note-content-${note._id}`} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, '& h1, & h2, & h3': { color: 'var(--dark-navy)', my: 2 }, '& ul, & ol': { pl: 3 }, '& li': { mb: 1 }}}>
                      <ReactMarkdown>{note.content}</ReactMarkdown>
                    </Box>
                    <Button sx={{mt: 2}} size="small" variant="outlined" onClick={() => handleDownloadPdf(note._id, 'lesson-note')}>Download as PDF</Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Container>
      </motion.div>

      <LessonNoteForm open={isNoteModalOpen} onClose={() => setNoteModalOpen(false)} onSubmit={handleNoteSubmit} subStrandName={selectedSubStrandName} />
    </>
  );
}

export default TeacherDashboard;