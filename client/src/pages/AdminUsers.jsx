import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';
import adminService from '../features/admin/adminService';

const AdminUsers = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState('');

  // 🧠 Load all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(page + 1);
      setRows(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🏫 Load all schools
  const fetchSchools = async () => {
    try {
      const data = await adminService.getSchools();
      setSchools(data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // ✅ Approve user
  const approveUser = async (id) => {
    try {
      await adminService.approveUser(id);
      fetchUsers();
    } catch (err) {
      console.error('Error approving user:', err);
    }
  };

  // ❌ Delete user
  const deleteUser = async (id) => {
    try {
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // 🏫 Open assign dialog
  const openAssign = async (user) => {
    setSelectedUser(user);
    await fetchSchools();
    setAssignOpen(true);
  };

  // 🧩 Assign user to school
  const assignToSchool = async () => {
    if (!selectedUser || !schoolId) return;
    try {
      await adminService.assignUserToSchool({
        userId: selectedUser._id,
        schoolId,
      });
      setAssignOpen(false);
      setSchoolId('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error assigning user:', err);
    }
  };

  return (
    <Box>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{ p: 3, borderRadius: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            User Management
          </Typography>
          <IconButton onClick={fetchUsers} title="Refresh">
            <RefreshIcon />
          </IconButton>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            )}

            {rows.map((u) => (
              <TableRow key={u._id}>
                <TableCell>{u.fullName || u.name || '—'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{u.role}</TableCell>
                <TableCell>{u.school?.name || '—'}</TableCell>

                {/* ✅ Properly show status */}
                <TableCell>
                  <Typography
                    sx={{
                      color:
                        u.status === 'approved'
                          ? 'green'
                          : u.status === 'pending'
                          ? 'orange'
                          : 'red',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {u.status}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  {/* ✅ Only show Approve button if pending */}
                  {u.status === 'pending' && (
                    <IconButton onClick={() => approveUser(u._id)} title="Approve">
                      <CheckIcon color="success" />
                    </IconButton>
                  )}
                  <IconButton onClick={() => openAssign(u)} title="Assign to School">
                    <SchoolIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteUser(u._id)} title="Delete">
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      {/* 🏫 Assign School Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign User to School</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {selectedUser?.fullName || selectedUser?.name} ({selectedUser?.email})
          </Typography>
          <FormControl fullWidth>
            <InputLabel>School</InputLabel>
            <Select
              label="School"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
            >
              {schools.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={assignToSchool} disabled={!schoolId}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
