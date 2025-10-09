import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchItems, fetchChildren, reset as resetCurriculum } from '../features/curriculum/curriculumSlice';

// --- MUI Imports ---
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
  Button
} from '@mui/material';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });

  // 1. Fetch initial top-level items (levels) on component mount
  useEffect(() => {
    dispatch(fetchItems('levels'));
    // Cleanup on unmount
    return () => {
      dispatch(resetCurriculum());
    }
  }, [dispatch]);

  // 2. Chain useEffects to fetch data on-demand as the user makes selections
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

  return (
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
            <Paper elevation={3} sx={{p: 3, textAlign: 'center'}}>
                <Typography variant="h5" gutterBottom>Content Creation</Typography>
                <Typography color="text.secondary" sx={{mb: 3}}>You have selected a Sub-Strand. You can now create content for this topic.</Typography>
                <Box display="flex" justifyContent="center" gap={2}>
                    <Button variant="contained">Create Lesson Note</Button>
                    <Button variant="contained">Create Quiz</Button>
                    <Button variant="contained">Upload Resource</Button>
                </Box>
            </Paper>
          </motion.div>
        )}
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;