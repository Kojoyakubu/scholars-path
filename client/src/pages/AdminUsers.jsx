// /client/src/pages/AdminUsers.jsx
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
    const data = await adminService.getSchools();
    setSchools(data || []);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // ✅ Approve user
  const approveUser = async (id) => {
    await adminService.approveUser(id);
    fetchUsers();
  };

  // ❌ Delete user
  const deleteUser = async (id) => {
    await adminService.deleteUser(id);
    fetchUsers();
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
    await adminService.assignUserToSchool({
      userId: selectedUser._id,
      schoolId,
    });
    setAssignOpen(false);
    setSchoolId('');
    setSelectedUser(null);
    fetchUsers();
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
          <Typography variant="h6" fontWeight={700}>User Management</Typography>
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
                <TableCell>{u.approved ? 'Approved' : 'Pending'}</TableCell>
                <TableCell align="right">
                  {!u.approved && (
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

      {/* Assign School Dialog */}
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
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
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
