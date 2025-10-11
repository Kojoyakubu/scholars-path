import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    fetchChildren,
    resetCurriculumState, // Corrected import
    clearChildren
} from '../features/curriculum/curriculumSlice';

import {
    Box, Typography, Container, Button, TextField, Paper, IconButton, Grid,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Reusable Sub-Components ---

const CrudItem = ({ item, onSelect, isSelected, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (name.trim()) {
        onUpdate(item._id, name);
        setIsEditing(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      onClick={() => onSelect && !isEditing && onSelect(item)}
      sx={{
        p: 1.5, m: 1,
        borderColor: isSelected ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
        backgroundColor: isSelected ? 'action.hover' : 'transparent',
        cursor: onSelect ? 'pointer' : 'default',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {isEditing ? (
        <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
          <TextField size="small" value={name} onChange={(e) => setName(e.target.value)} autoFocus fullWidth />
          <IconButton type="submit" color="primary"><SaveIcon /></IconButton>
          <IconButton onClick={() => setIsEditing(false)}><CancelIcon /></IconButton>
        </Box>
      ) : (
        <>
          <Typography>{item.name}</Typography>
          <Box>
            <IconButton size="small" onClick={() => setIsEditing(true)}><EditIcon /></IconButton>
            <IconButton size="small" onClick={() => onDelete(item._id)} color="error"><DeleteIcon /></IconButton>
          </Box>
        </>
      )}
    </Paper>
  );
};

const AddForm = ({ onSubmit, value, onChange, placeholder, buttonText, disabled }) => (
  <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', gap: 1, m: 1 }}>
    <TextField size="small" fullWidth label={placeholder} value={value} onChange={onChange} disabled={disabled} />
    <Button type="submit" variant="contained" disabled={disabled}>{buttonText}</Button>
  </Box>
);

// --- Main Page Component ---

function AdminCurriculum() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands, isLoading } = useSelector((state) => state.curriculum);

  const [formData, setFormData] = useState({ levels: '', classes: '', subjects: '', strands: '', subStrands: '' });
  const [selected, setSelected] = useState({ level: null, class: null, subject: null, strand: null });
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchItems({ entity: 'levels' }));
    return () => {
      // Dispatch the correctly named reset action on unmount
      dispatch(resetCurriculumState());
    }
  }, [dispatch]);

  const handleFormChange = (entity) => (e) => {
    setFormData(prev => ({ ...prev, [entity]: e.target.value }));
  };

  const handleSelect = useCallback((type, item) => {
    setSelected(prev => {
      const newSelected = { ...prev, [type]: item };
      if (type === 'level') {
        newSelected.class = null; newSelected.subject = null; newSelected.strand = null;
        dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: item._id }));
        dispatch(clearChildren({ entities: ['subjects', 'strands', 'subStrands'] }));
      }
      if (type === 'class') {
        newSelected.subject = null; newSelected.strand = null;
        dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: item._id }));
        dispatch(clearChildren({ entities: ['strands', 'subStrands'] }));
      }
      if (type === 'subject') {
        newSelected.strand = null;
        dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: item._id }));
        dispatch(clearChildren({ entities: ['subStrands'] }));
      }
      if (type === 'strand') {
        dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: item._id }));
      }
      return newSelected;
    });
  }, [dispatch]);

  const handleAdd = useCallback((entity, parentData) => (e) => {
    e.preventDefault();
    const name = formData[entity];
    if (!name.trim()) return;

    let itemData = { name };
    if (parentData) {
      itemData[parentData.type] = parentData.id;
    }

    dispatch(createItem({ entity, itemData }));
    setFormData(prev => ({ ...prev, [entity]: '' }));
  }, [dispatch, formData]);

  const handleUpdate = useCallback((entity, id, name) => {
    dispatch(updateItem({ entity, itemData: { id, name } }));
  }, [dispatch]);

  const openDeleteDialog = useCallback((deleteInfo) => {
    setItemToDelete(deleteInfo);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setItemToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      dispatch(deleteItem(itemToDelete));
      setItemToDelete(null);
    }
  }, [dispatch, itemToDelete]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="xl">
        <Box textAlign="center" my={5}><Typography variant="h4" component="h1">Curriculum Management</Typography></Box>
        <Grid container spacing={2}>
          {/* Levels */}
          <Grid item xs={12} md={6} lg={4}><Paper elevation={3} sx={{p: 2}}><Typography variant="h6">1. Levels</Typography><AddForm onSubmit={handleAdd('levels')} value={formData.levels} onChange={handleFormChange('levels')} placeholder='New Level' buttonText='Add' />{isLoading && levels.length === 0 ? <CircularProgress /> : levels.map(item => <CrudItem key={item._id} item={item} onSelect={handleSelect.bind(null, 'level')} isSelected={selected.level?._id === item._id} onUpdate={handleUpdate.bind(null, 'levels')} onDelete={openDeleteDialog.bind(null, { entity: 'levels', itemId: item._id })} />)}</Paper></Grid>
          {/* Classes */}
          <Grid item xs={12} md={6} lg={4}><Paper elevation={3} sx={{p: 2}}><Typography variant="h6">2. Classes</Typography><AddForm onSubmit={handleAdd('classes', { type: 'level', id: selected.level?._id })} value={formData.classes} onChange={handleFormChange('classes')} placeholder='New Class' buttonText='Add' disabled={!selected.level} />{selected.level && (isLoading && classes.length === 0 ? <CircularProgress /> : classes.map(item => <CrudItem key={item._id} item={item} onSelect={handleSelect.bind(null, 'class')} isSelected={selected.class?._id === item._id} onUpdate={handleUpdate.bind(null, 'classes')} onDelete={openDeleteDialog.bind(null, { entity: 'classes', itemId: item._id })} />))}</Paper></Grid>
          {/* Subjects */}
          <Grid item xs={12} md={6} lg={4}><Paper elevation={3} sx={{p: 2}}><Typography variant="h6">3. Subjects</Typography><AddForm onSubmit={handleAdd('subjects', { type: 'class', id: selected.class?._id })} value={formData.subjects} onChange={handleFormChange('subjects')} placeholder='New Subject' buttonText='Add' disabled={!selected.class} />{selected.class && (isLoading && subjects.length === 0 ? <CircularProgress /> : subjects.map(item => <CrudItem key={item._id} item={item} onSelect={handleSelect.bind(null, 'subject')} isSelected={selected.subject?._id === item._id} onUpdate={handleUpdate.bind(null, 'subjects')} onDelete={openDeleteDialog.bind(null, { entity: 'subjects', itemId: item._id })} />))}</Paper></Grid>
          {/* Strands */}
          <Grid item xs={12} md={6}><Paper elevation={3} sx={{p: 2, mt: 2}}><Typography variant="h6">4. Strands</Typography><AddForm onSubmit={handleAdd('strands', { type: 'subject', id: selected.subject?._id })} value={formData.strands} onChange={handleFormChange('strands')} placeholder='New Strand' buttonText='Add' disabled={!selected.subject} />{selected.subject && (isLoading && strands.length === 0 ? <CircularProgress /> : strands.map(item => <CrudItem key={item._id} item={item} onSelect={handleSelect.bind(null, 'strand')} isSelected={selected.strand?._id === item._id} onUpdate={handleUpdate.bind(null, 'strands')} onDelete={openDeleteDialog.bind(null, { entity: 'strands', itemId: item._id })} />))}</Paper></Grid>
          {/* Sub-Strands */}
          <Grid item xs={12} md={6}><Paper elevation={3} sx={{p: 2, mt: 2}}><Typography variant="h6">5. Sub-Strands</Typography><AddForm onSubmit={handleAdd('subStrands', { type: 'strand', id: selected.strand?._id })} value={formData.subStrands} onChange={handleFormChange('subStrands')} placeholder='New Sub-Strand' buttonText='Add' disabled={!selected.strand} />{selected.strand && (isLoading && subStrands.length === 0 ? <CircularProgress /> : subStrands.map(item => <CrudItem key={item._id} item={item} onSelect={null} isSelected={false} onUpdate={handleUpdate.bind(null, 'subStrands')} onDelete={openDeleteDialog.bind(null, { entity: 'subStrands', itemId: item._id })} />))}</Paper></Grid>
        </Grid>
      </Container>
      <Dialog open={!!itemToDelete} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete this item? This may also delete all child items associated with it.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={closeDeleteDialog}>Cancel</Button><Button onClick={confirmDelete} color="error" autoFocus>Delete</Button></DialogActions>
      </Dialog>
    </motion.div>
  );
}

export default AdminCurriculum;