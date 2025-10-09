import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, reset as resetCurriculum } from '../features/curriculum/curriculumSlice';
import { generateLessonNote, reset as resetTeacher } from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const curriculumState = useSelector((state) => state.curriculum);
  const teacherState = useSelector((state) => state.teacher);
  
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

    html2canvas(input, { scale: 2 }) // Higher scale for better quality
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let newCanvasWidth = pdfWidth - 20; // A4 width with margin
        let newCanvasHeight = newCanvasWidth / ratio;

        if (newCanvasHeight > pdfHeight - 20) {
            newCanvasHeight = pdfHeight - 20;
            newCanvasWidth = newCanvasHeight * ratio;
        }

        const x = (pdfWidth - newCanvasWidth) / 2;
        const y = 10; // Top margin

        pdf.addImage(imgData, 'PNG', x, y, newCanvasWidth, newCanvasHeight);
        pdf.save(`${noteTopic || 'lesson-note'}.pdf`);
      });
  };

  const selectedSubStrandName = curriculumState.subStrands.find(s => s._id === selections.subStrand)?.name || '';

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Container>
          <Box textAlign="center" my={5}>
              <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: '600'}}>
                Teacher Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Select a topic to begin creating content.
              </Typography>
          </Box>
          
          {teacherState.isSuccess && teacherState.message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(resetTeacher())}>{teacherState.message}</Alert>}
          {teacherState.isError && teacherState.message && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(resetTeacher())}>{teacherState.message}</Alert>}

          <Paper elevation={3} sx={{padding: 3, mb: 5}}>
            <Typography variant="h6" gutterBottom>Browse Curriculum</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Level</InputLabel><Select name="level" value={selections.level} label="Level" onChange={handleSelectionChange}>{curriculumState.levels.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.level}><InputLabel>Class</InputLabel><Select name="class" value={selections.class} label="Class" onChange={handleSelectionChange}>{curriculumState.classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.class}><InputLabel>Subject</InputLabel><Select name="subject" value={selections.subject} label="Subject" onChange={handleSelectionChange}>{curriculumState.subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={3}><FormControl fullWidth disabled={!selections.subject}><InputLabel>Strand</InputLabel><Select name="strand" value={selections.strand} label="Strand" onChange={handleSelectionChange}>{curriculumState.strands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12}><FormControl fullWidth disabled={!selections.strand}><InputLabel>Sub-Strand</InputLabel><Select name="subStrand" value={selections.subStrand} label="Sub-Strand" onChange={handleSelectionChange}>{curriculumState.subStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
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

          {teacherState.isLoading && (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress />
              <Typography sx={{ml: 2}}>Generating your lesson note with AI...</Typography>
            </Box>
          )}
          {teacherState.lessonNotes.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>My Generated Notes</Typography>
              {teacherState.lessonNotes.map((note) => (
                <Accordion key={note._id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Note for {selectedSubStrandName || '...'} created on {new Date(note.createdAt).toLocaleDateString()}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box id={`note-content-${note._id}`} sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                      {note.content}
                    </Box>
                    <Button sx={{mt: 2}} size="small" variant="outlined" onClick={() => handleDownloadPdf(note._id, 'lesson-note')}>
                        Download as PDF
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Container>
      </motion.div>

      <LessonNoteForm 
        open={isNoteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleNoteSubmit}
        subStrandName={selectedSubStrandName}
      />
    </>
  );
}

export default TeacherDashboard;