import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSchools, createSchool, deleteSchool } from '../features/admin/adminSlice';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Button, TextField, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';

function AdminSchools() {
  const dispatch = useDispatch();
  const { schools, isLoading } = useSelector((state) => state.admin);
  
  // State for the form
  const [schoolName, setSchoolName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    dispatch(getSchools());
  }, [dispatch]);

  const handleAddSchool = (e) => {
    e.preventDefault();
    dispatch(createSchool({ name: schoolName, schoolAdminEmail: adminEmail }));
    setSchoolName('');
    setAdminEmail('');
  };

  const handleDeleteSchool = (schoolId) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      dispatch(deleteSchool(schoolId));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">School Management</Typography>
        </Box>

        <Paper elevation={3} sx={{p: 3, mb: 4}}>
          <Typography variant="h6" gutterBottom>Add New School</Typography>
          <Box component="form" onSubmit={handleAddSchool}>
            <TextField
              fullWidth
              margin="normal"
              label="New School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email of School Administrator"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{mt: 2}} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create School'}
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{p: 3}}>
          <Typography variant="h6" gutterBottom>Existing Schools</Typography>
          <List>
            {schools.map((school) => (
              <ListItem
                key={school._id}
                secondaryAction={
                  <>
                    <IconButton component={RouterLink} to={`/school/dashboard/${school._id}`} edge="end" aria-label="dashboard">
                      <DashboardIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSchool(school._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText primary={school.name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default AdminSchools;