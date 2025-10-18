import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSchools, createSchool, deleteSchool } from '../features/admin/adminSlice';
import { motion } from 'framer-motion';
import {
  Box, Typography, Container, Button, TextField, Paper, List,
  ListItem, ListItemText, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';

function AdminSchools() {
  const dispatch = useDispatch();
  const { schools, isLoading } = useSelector((state) => state.admin);

  // State for the creation form
  const [formData, setFormData] = useState({ name: '', adminName: '', adminEmail: '', adminPassword: '' });
  // State for the deletion confirmation dialog
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  useEffect(() => {
    dispatch(getSchools());
  }, [dispatch]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddSchool = useCallback((e) => {
    e.preventDefault();
    dispatch(createSchool(formData));
    setFormData({ name: '', adminName: '', adminEmail: '', adminPassword: '' }); // Reset form
  }, [dispatch, formData]);

  const openDeleteDialog = (school) => setSchoolToDelete(school);
  const closeDeleteDialog = () => setSchoolToDelete(null);

  const confirmDelete = useCallback(() => {
    if (schoolToDelete) {
      dispatch(deleteSchool(schoolToDelete._id));
      closeDeleteDialog();
    }
  }, [dispatch, schoolToDelete]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">School Management</Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Add New School</Typography>
          <Box component="form" onSubmit={handleAddSchool}>
            <Stack spacing={2}>
              <TextField name="name" label="New School Name" value={formData.name} onChange={handleFormChange} required />
              <TextField name="adminName" label="Full Name of School Admin" value={formData.adminName} onChange={handleFormChange} required />
              <TextField name="adminEmail" label="Email of School Admin" type="email" value={formData.adminEmail} onChange={handleFormChange} required />
              <TextField name="adminPassword" label="Initial Password for Admin" type="password" value={formData.adminPassword} onChange={handleFormChange} required />
              <Box><Button type="submit" variant="contained" sx={{ mt: 1 }} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create School'}</Button></Box>
            </Stack>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Existing Schools</Typography>
          <List>
            {schools.map((school) => (
              <ListItem key={school._id} secondaryAction={
                <>
                  <IconButton component={RouterLink} to={`/school/dashboard/${school._id}`} aria-label="dashboard"><DashboardIcon /></IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => openDeleteDialog(school)}><DeleteIcon color="error" /></IconButton>
                </>
              }>
                <ListItemText primary={school.name} secondary={`Admin: ${school.admin?.email || 'N/A'}`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!schoolToDelete} onClose={closeDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the school "<strong>{schoolToDelete?.name}</strong>"? This action will also delete all associated users and cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" autoFocus>Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}

export default AdminSchools;