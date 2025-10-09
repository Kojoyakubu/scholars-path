import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers, approveUser, deleteUser, getSchools, assignUserToSchool } from '../features/admin/adminSlice';
import { motion } from 'framer-motion';

// --- MUI Imports ---
import { 
  Box, Typography, Container, Button, Select, MenuItem, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Pagination, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

function AdminUsers() {
  const dispatch = useDispatch();
  const { users, schools, isLoading, page, pages } = useSelector((state) => state.admin);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    // Fetch users for the current page
    dispatch(getUsers(currentPage));
    // Fetch schools only once
    if (schools.length === 0) {
      dispatch(getSchools());
    }
  }, [dispatch, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleApprove = (userId) => {
    dispatch(approveUser(userId));
  };

  const openDeleteConfirmation = (userId) => {
    setUserToDelete(userId);
    setOpenDeleteDialog(true);
  };

  const closeDeleteConfirmation = () => {
    setUserToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDelete = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete));
    }
    closeDeleteConfirmation();
  };

  const handleSchoolChange = (userId, schoolId) => {
    if (schoolId) {
      dispatch(assignUserToSchool({ userId, schoolId }));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>User Management</Typography>
          <Typography variant="h6" color="text.secondary">Approve pending accounts and assign users to schools.</Typography>
        </Box>

        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="user management table">
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
              {isLoading && users.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (
                users.map((user) => (
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
                          <Button variant="outlined" color="error" size="small" onClick={() => openDeleteConfirmation(user._id)}>Delete</Button>
                        )}
                        {user.role !== 'admin' && (
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select
                              displayEmpty
                              value={user.school || ''}
                              onChange={(e) => handleSchoolChange(user._id, e.target.value)}
                            >
                              <MenuItem value=""><em>Assign School</em></MenuItem>
                              {schools.map((school) => (
                                <MenuItem key={school._id} value={school._id}>{school.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {pages > 1 && (
            <Pagination
              count={pages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          )}
        </Box>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteConfirmation}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

export default AdminUsers;