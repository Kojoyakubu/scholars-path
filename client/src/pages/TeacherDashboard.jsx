import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, reset as resetCurriculum } from '../features/curriculum/curriculumSlice';
import { generateLessonNote, getMyLessonNotes, reset as resetTeacher } from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';

import { 
  Box, Typography, Container, Grid, Select, MenuItem, FormControl, 
  InputLabel, Paper, Button, Alert, CircularProgress, Accordion, 
  AccordionSummary, AccordionDetails, Dialog, DialogActions, 
  DialogContent, DialogTitle, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { isSuccess, isError, isLoading, message, lessonNotes } = useSelector((state) => state.teacher);
  
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isPdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfData, setPdfData] = useState({ teacherName: '', schoolName: '' });
  const [noteToDownload, setNoteToDownload] = useState(null);

  useEffect(() => {
    dispatch(fetchItems('levels'));
    dispatch(getMyLessonNotes());
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
    const noteData = { ...formData, subStrandId: selections.subStrand };
    dispatch(generateLessonNote(noteData));
  };
  
  const openPdfModal = (note) => {
    setNoteToDownload(note);
    setPdfData({ teacherName: user?.fullName || '', schoolName: '' });
    setPdfModalOpen(true);
  };

  const handlePdfDataChange = (e) => {
    setPdfData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleConfirmDownload = () => {
    const input = document.getElementById(`note-content-${noteToDownload._id}`);
    if (!input) return;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    pdf.setFontSize(16);
    pdf.text(pdfData.schoolName, 15, 15);
    pdf.setFontSize(12);
    pdf.text(`Teacher: ${pdfData.teacherName}`, 15, 22);
    pdf.html(input, {
        callback: function(doc) { doc.save(`lesson-note.pdf`); },
        margin: [15, 15, 15, 15],
        autoPaging: 'text',
        width: 180,
        windowWidth: 675
    });
    setPdfModalOpen(false);
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
                    <Box id={`note-content-${note._id}`} sx={{ p: 2, '& h1, & h2, & h3': { color: 'var(--dark-navy)', my: 2, fontSize: '1.2em' }, '& ul, & ol': { pl: 3 }, '& li': { mb: 1 }}}>
                      <ReactMarkdown>{note.content}</ReactMarkdown>
                    </Box>
                    <Button sx={{mt: 2}} size="small" variant="outlined" onClick={() => openPdfModal(note)}>Download as PDF</Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Container>
      </motion.div>

      <LessonNoteForm open={isNoteModalOpen} onClose={() => setNoteModalOpen(false)} onSubmit={handleNoteSubmit} subStrandName={selectedSubStrandName} />

      <Dialog open={isPdfModalOpen} onClose={() => setPdfModalOpen(false)}>
        <DialogTitle>PDF Header Details</DialogTitle>
        <DialogContent>
            <TextField autoFocus margin="dense" name="schoolName" label="School Name" type="text" fullWidth variant="standard" value={pdfData.schoolName} onChange={handlePdfDataChange} />
            <TextField margin="dense" name="teacherName" label="Teacher's Name" type="text" fullWidth variant="standard" value={pdfData.teacherName} onChange={handlePdfDataChange} />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setPdfModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDownload} variant="contained">Confirm & Download</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TeacherDashboard;