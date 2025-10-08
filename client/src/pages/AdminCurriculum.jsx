import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  getLevels, createLevel, updateLevel, deleteLevel,
  getClasses, createClass, updateClass, deleteClass,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getStrands, createStrand, updateStrand, deleteStrand,
  getSubStrands, createSubStrand, updateSubStrand, deleteSubStrand
} from '../features/curriculum/curriculumSlice';

// --- MUI Imports ---
import { Box, Typography, Container, Button, TextField, Paper, IconButton, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Generic Item Component for displaying, editing, and deleting items
const CrudItem = ({ item, onSelect, isSelected, updateAction, deleteAction, idKey }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);

  const handleDelete = () => {
    if (window.confirm('Are you sure? This may affect child items.')) {
      dispatch(deleteAction(item._id));
    }
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateAction({ [idKey]: item._id, name }));
    setIsEditing(false);
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 1.5, m: 1, 
        borderColor: isSelected ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
        borderWidth: isSelected ? 2 : 1
      }}
    >
      {isEditing ? (
        <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField size="small" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} autoFocus fullWidth />
          <IconButton type="submit" color="primary"><SaveIcon /></IconButton>
          <IconButton onClick={() => setIsEditing(false)}><CancelIcon /></IconButton>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography onClick={() => onSelect && onSelect(item)} sx={{ cursor: onSelect ? 'pointer' : 'default', flexGrow: 1 }}>
            {item.name}
          </Typography>
          <IconButton size="small" onClick={() => setIsEditing(true)}><EditIcon /></IconButton>
          <IconButton size="small" onClick={handleDelete}><DeleteIcon /></IconButton>
        </Box>
      )}
    </Paper>
  );
};

// Generic Form Component for adding new items
const AddForm = ({ onSubmit, value, onChange, placeholder, buttonText, disabled }) => (
  <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', gap: 1, p: 1 }}>
    <TextField size="small" fullWidth value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
    <Button type="submit" variant="contained" disabled={disabled}>{buttonText}</Button>
  </Box>
);

function AdminCurriculum() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands, isLoading } = useSelector((state) => state.curriculum);
  
  const [formData, setFormData] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [selected, setSelected] = useState({ level: null, class: null, subject: null, strand: null });

  useEffect(() => {
    dispatch(getLevels()); dispatch(getClasses()); dispatch(getSubjects()); dispatch(getStrands()); dispatch(getSubStrands());
  }, [dispatch]);

  const handleSelect = (type, item) => {
    const newSelected = { level: selected.level, class: selected.class, subject: selected.subject, strand: selected.strand };
    if (type === 'level') { newSelected.level = item; newSelected.class = null; newSelected.subject = null; newSelected.strand = null; }
    if (type === 'class') { newSelected.class = item; newSelected.subject = null; newSelected.strand = null; }
    if (type === 'subject') { newSelected.subject = item; newSelected.strand = null; }
    if (type === 'strand') { newSelected.strand = item; }
    setSelected(newSelected);
  };
  
  const handleAdd = (type, creator) => (e) => {
    e.preventDefault();
    let data = { name: formData[type] };
    if (type === 'class') data.level = selected.level._id;
    if (type === 'subject') data.class = selected.class._id;
    if (type === 'strand') data.subject = selected.subject._id;
    if (type === 'subStrand') data.strand = selected.strand._id;
    dispatch(creator(data));
    setFormData(prev => ({ ...prev, [type]: '' }));
  };
  
  const handleFormChange = (type) => (e) => setFormData(prev => ({ ...prev, [type]: e.target.value }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container>
        <Box textAlign="center" my={5}><Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>Curriculum Management</Typography></Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Paper elevation={3} sx={{p: 2}}>
            <Typography variant="h6">1. Academic Levels</Typography>
            <AddForm onSubmit={handleAdd('level', createLevel)} value={formData.level} onChange={handleFormChange('level')} placeholder='New Level' buttonText='Add' />
            {levels.map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('level', item)} isSelected={selected.level?._id === item._id} updateAction={updateLevel} deleteAction={deleteLevel} idKey="levelId" />)}
          </Paper></Grid>

          <Grid item xs={12} md={4}><Paper elevation={3} sx={{p: 2, minHeight: '100%'}}>
            <Typography variant="h6">2. Classes</Typography>
            <AddForm onSubmit={handleAdd('class', createClass)} value={formData.class} onChange={handleFormChange('class')} placeholder='New Class' buttonText='Add' disabled={!selected.level} />
            {selected.level && classes.filter(c => c.level._id === selected.level._id).map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('class', item)} isSelected={selected.class?._id === item._id} updateAction={updateClass} deleteAction={deleteClass} idKey="classId" />)}
          </Paper></Grid>

          <Grid item xs={12} md={4}><Paper elevation={3} sx={{p: 2, minHeight: '100%'}}>
            <Typography variant="h6">3. Subjects</Typography>
            <AddForm onSubmit={handleAdd('subject', createSubject)} value={formData.subject} onChange={handleFormChange('subject')} placeholder='New Subject' buttonText='Add' disabled={!selected.class} />
            {selected.class && subjects.filter(s => s.class._id === selected.class._id).map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('subject', item)} isSelected={selected.subject?._id === item._id} updateAction={updateSubject} deleteAction={deleteSubject} idKey="subjectId" />)}
          </Paper></Grid>
          
          {/* Strands and Sub-strands can be in a new row for clarity */}
          <Grid item xs={12} md={6}><Paper elevation={3} sx={{p: 2, mt: 2, minHeight: '100%'}}>
            <Typography variant="h6">4. Strands</Typography>
            <AddForm onSubmit={handleAdd('strand', createStrand)} value={formData.strand} onChange={handleFormChange('strand')} placeholder='New Strand' buttonText='Add' disabled={!selected.subject} />
            {selected.subject && strands.filter(s => s.subject._id === selected.subject._id).map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('strand', item)} isSelected={selected.strand?._id === item._id} updateAction={updateStrand} deleteAction={deleteStrand} idKey="strandId" />)}
          </Paper></Grid>

          <Grid item xs={12} md={6}><Paper elevation={3} sx={{p: 2, mt: 2, minHeight: '100%'}}>
            <Typography variant="h6">5. Sub-Strands</Typography>
            <AddForm onSubmit={handleAdd('subStrand', createSubStrand)} value={formData.subStrand} onChange={handleFormChange('subStrand')} placeholder='New Sub-Strand' buttonText='Add' disabled={!selected.strand} />
            {selected.strand && subStrands.filter(s => s.strand._id === selected.strand._id).map(item => <CrudItem key={item._id} item={item} onSelect={null} isSelected={false} updateAction={updateSubStrand} deleteAction={deleteSubStrand} idKey="subStrandId" />)}
          </Paper></Grid>
        </Grid>
      </Container>
    </motion.div>
  );
}

export default AdminCurriculum;