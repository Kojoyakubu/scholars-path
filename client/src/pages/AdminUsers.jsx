import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, getAiInsights, deleteUser } from '../../features/admin/adminSlice';
import {
  Box, Typography, CircularProgress, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import AIInsightsCard from '../../components/AIInsightsCard';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, aiInsights, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getAiInsights({ endpoint: '/api/admin/users/insights' }));
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress color="primary" />
        <Typography mt={2}>Loading users...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" textAlign="center" mt={4}>{error}</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">User Management</Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow
                key={user._id}
                component={motion.tr}
                whileHover={{ backgroundColor: '#f9f9f9' }}
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Delete User">
                    <IconButton color="error" onClick={() => handleDelete(user._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AIInsightsCard title="AI Insights on Users" content={aiInsights} />
    </Box>
  );
};

export default AdminUsers;
