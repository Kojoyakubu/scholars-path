import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers, approveTeacher, deleteUser, getSchools, assignUserToSchool } from '../features/admin/adminSlice';
import { motion } from 'framer-motion';

// --- MUI Imports ---
import { 
  Box, Typography, Container, Button, Select, MenuItem, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

function AdminUsers() {
  const dispatch = useDispatch();
  const { users, schools, isLoading } = useSelector((state) => state.admin);
  const [schoolAssignments, setSchoolAssignments] = useState({});

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getSchools());
  }, [dispatch]);

  const handleApprove = (userId) => { /* ... */ };
  const handleDelete = (userId) => { /* ... */ };
  const handleSchoolChange = (userId, schoolId) => { /* ... */ };
  const handleAssign = (userId) => { /* ... */ };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>User Management</Typography>
          <Typography variant="h6" color="text.secondary">Approve pending accounts and assign users to schools.</Typography>
        </Box>

        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f4f6f8' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>School</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>{schools.find(s => s._id === user.school)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} alignItems="center">
                      {user.status === 'pending' && (
                        <Button variant="contained" size="small" onClick={() => handleApprove(user._id)}>Approve</Button>
                      )}
                      {user.role !== 'admin' && (
                        <Button variant="contained" color="error" size="small" onClick={() => handleDelete(user._id)}>Delete</Button>
                      )}
                      {user.role !== 'admin' && (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            displayEmpty
                            onChange={(e) => handleSchoolChange(user._id, e.target.value)}
                            defaultValue={user.school || ''}
                          >
                            <MenuItem value=""><em>Assign School</em></MenuItem>
                            {schools.map((school) => (
                              <MenuItem key={school._id} value={school._id}>{school.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      {user.role !== 'admin' && <Button size="small" onClick={() => handleAssign(user._id)}>Assign</Button>}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </motion.div>
  );
}

export default AdminUsers;