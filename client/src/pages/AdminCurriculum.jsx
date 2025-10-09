import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
    fetchItems, 
    createItem, 
    updateItem, 
    deleteItem, 
    fetchChildren,
    reset as resetCurriculum
} from '../features/curriculum/curriculumSlice';

import { Box, Typography, Container, Button, TextField, Paper, IconButton, Grid, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Generic Item Component for displaying, editing, and deleting items
const CrudItem = ({ item, onSelect, isSelected, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate(item._id, name);
    setIsEditing(false);
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 1.5, m: 1, 
        borderColor: isSelected ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
        borderWidth: isSelected ? 2 : 1,
        cursor: onSelect ? 'pointer' : 'default',
      }}
      onClick={() => onSelect && !isEditing && onSelect(item)}
    >
      {isEditing ? (
        <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField size="small" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus fullWidth />
          <IconButton type="submit" color="primary" onClick={(e) => e.stopPropagation()}><SaveIcon /></IconButton>
          <IconButton onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}><CancelIcon /></IconButton>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ flexGrow: 1 }}>
            {item.name}
          </Typography>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}><EditIcon /></IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}><DeleteIcon /></IconButton>
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
  
  const [formData, setFormData] = useState({ levels: '', classes: '', subjects: '', strands: '', subStrands: '' });
  const [selected, setSelected] = useState({ level: null, class: null, subject: null, strand: null });
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchItems('levels'));
    return () => {
      dispatch(resetCurriculum());
    }
  }, [dispatch]);

  const handleSelect = (type, item) => {
    const newSelected = { ...selected };
    if (type === 'level') {
      newSelected.level = item;
      newSelected.class = null;
      newSelected.subject = null;
      newSelected.strand = null;
      dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: item._id }));
    }
    if (type === 'class') {
      newSelected.class = item;
      newSelected.subject = null;
      newSelected.strand = null;
      dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: item._id }));
    }
    if (type === 'subject') {
      newSelected.subject = item;
      newSelected.strand = null;
      dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: item._id }));
    }
    if (type === 'strand') {
      newSelected.strand = item;
      dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: item._id }));
    }
    setSelected(newSelected);
  };
  
  const handleAdd = (entity, parentData) => (e) => {
    e.preventDefault();
    let itemData = { name: formData[entity] };
    if (parentData) {
      itemData[parentData.type] = parentData.id;
    }
    dispatch(createItem({ entity, itemData }));
    setFormData(prev => ({ ...prev, [entity]: '' }));
  };
  
  const handleFormChange = (type) => (e) => setFormData(prev => ({ ...prev, [type]: e.target.value }));

  const openDeleteDialog = (entity, itemId) => setItemToDelete({ entity, itemId });
  const closeDeleteDialog = () => setItemToDelete(null);
  const confirmDelete = () => {
    if (itemToDelete) {
      dispatch(deleteItem(itemToDelete));
      closeDeleteDialog();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container>
        <Box textAlign="center" my={5}><Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>Curriculum Management</Typography></Box>

        <Grid container spacing={2}>
          {/* Levels */}
          <Grid item xs={12} md={4}><Paper elevation={3} sx={{p: 2}}>
            <Typography variant="h6">1. Academic Levels</Typography>
            <AddForm onSubmit={handleAdd('levels')} value={formData.levels} onChange={handleFormChange('levels')} placeholder='New Level' buttonText='Add' />
            {isLoading && levels.length === 0 ? <CircularProgress /> : levels.map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('level', item)} isSelected={selected.level?._id === item._id} onUpdate={(id, name) => dispatch(updateItem({ entity: 'levels', itemData: { id, name } }))} onDelete={(id) => openDeleteDialog({ entity: 'levels', itemId: id })} />)}
          </Paper></Grid>

          {/* Classes */}
          <Grid item xs={12} md={4}><Paper elevation={3} sx={{p: 2, minHeight: '100%'}}>
            <Typography variant="h6">2. Classes</Typography>
            <AddForm onSubmit={handleAdd('classes', { type: 'level', id: selected.level?._id })} value={formData.classes} onChange={handleFormChange('classes')} placeholder='New Class' buttonText='Add' disabled={!selected.level} />
            {selected.level && (isLoading ? <CircularProgress /> : classes.map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('class', item)} isSelected={selected.class?._id === item._id} onUpdate={(id, name) => dispatch(updateItem({ entity: 'classes', itemData: { id, name } }))} onDelete={(id) => openDeleteDialog({ entity: 'classes', itemId: id })} />))}
          </Paper></Grid>

          {/* Subjects */}
          <Grid item xs={12} md={4}><Paper elevation={3} sx={{p: 2, minHeight: '100%'}}>
            <Typography variant="h6">3. Subjects</Typography>
            <AddForm onSubmit={handleAdd('subjects', { type: 'class', id: selected.class?._id })} value={formData.subjects} onChange={handleFormChange('subjects')} placeholder='New Subject' buttonText='Add' disabled={!selected.class} />
            {selected.class && (isLoading ? <CircularProgress /> : subjects.map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('subject', item)} isSelected={selected.subject?._id === item._id} onUpdate={(id, name) => dispatch(updateItem({ entity: 'subjects', itemData: { id, name } }))} onDelete={(id) => openDeleteDialog({ entity: 'subjects', itemId: id })} />))}
          </Paper></Grid>
          
          {/* Strands */}
          <Grid item xs={12} md={6}><Paper elevation={3} sx={{p: 2, mt: 2, minHeight: '100%'}}>
            <Typography variant="h6">4. Strands</Typography>
            <AddForm onSubmit={handleAdd('strands', { type: 'subject', id: selected.subject?._id })} value={formData.strands} onChange={handleFormChange('strands')} placeholder='New Strand' buttonText='Add' disabled={!selected.subject} />
            {selected.subject && (isLoading ? <CircularProgress /> : strands.map(item => <CrudItem key={item._id} item={item} onSelect={() => handleSelect('strand', item)} isSelected={selected.strand?._id === item._id} onUpdate={(id, name) => dispatch(updateItem({ entity: 'strands', itemData: { id, name } }))} onDelete={(id) => openDeleteDialog({ entity: 'strands', itemId: id })} />))}
          </Paper></Grid>

          {/* Sub-Strands */}
          <Grid item xs={12} md={6}><Paper elevation={3} sx={{p: 2, mt: 2, minHeight: '100%'}}>
            <Typography variant="h6">5. Sub-Strands</Typography>
            <AddForm onSubmit={handleAdd('subStrands', { type: 'strand', id: selected.strand?._id })} value={formData.subStrands} onChange={handleFormChange('subStrands')} placeholder='New Sub-Strand' buttonText='Add' disabled={!selected.strand} />
            {selected.strand && (isLoading ? <CircularProgress /> : subStrands.map(item => <CrudItem key={item._id} item={item} onSelect={null} isSelected={false} onUpdate={(id, name) => dispatch(updateItem({ entity: 'subStrands', itemData: { id, name } }))} onDelete={(id) => openDeleteDialog({ entity: 'subStrands', itemId: id })} />))}
          </Paper></Grid>
        </Grid>
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete this item? This may also delete all child items associated with it.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

export default AdminCurriculum;