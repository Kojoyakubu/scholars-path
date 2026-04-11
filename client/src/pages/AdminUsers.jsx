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
  TextField,
  Alert,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import BlockIcon from '@mui/icons-material/Block';
import ReplayIcon from '@mui/icons-material/Replay';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUsers,
  getSchools,
  approveUser,
  suspendUser,
  unsuspendUser,
  deleteUser,
  assignUserToSchool,
  setDownloadExemption,
} from '../features/admin/adminSlice';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, schools, isLoading } = useSelector((state) => state.admin);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [schoolId, setSchoolId] = useState('');
  const [exemptionOpen, setExemptionOpen] = useState(false);
  const [exemptionUser, setExemptionUser] = useState(null);
  const [exemptionReason, setExemptionReason] = useState('');
  const [exemptionUntil, setExemptionUntil] = useState('');
  const [exemptionError, setExemptionError] = useState('');

  // 🧠 Load all users
  const fetchUsers = async () => {
    try {
      const data = await dispatch(getUsers(page + 1)).unwrap();
      setTotal(data.total || 0);
    } catch (err) {
      // Handled by admin slice error state
    }
  };

  // 🏫 Load all schools
  const fetchSchools = async () => {
    try {
      await dispatch(getSchools()).unwrap();
    } catch (err) {
      // Handled by admin slice error state
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // ✅ Approve user
  const onApproveUser = async (id) => {
    try {
      await dispatch(approveUser(id)).unwrap();
      fetchUsers();
    } catch (err) {
      // Handled by admin slice error state
    }
  };

  // ⛔ Suspend user
  const onSuspendUser = async (id) => {
    try {
      await dispatch(suspendUser(id)).unwrap();
      fetchUsers();
    } catch (err) {
      // Handled by admin slice error state
    }
  };

  // 🔄 Unsuspend user
  const onUnsuspendUser = async (id) => {
    try {
      await dispatch(unsuspendUser(id)).unwrap();
      fetchUsers();
    } catch (err) {
      // Handled by admin slice error state
    }
  };

  // ❌ Delete user
  const onDeleteUser = async (id) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      fetchUsers();
    } catch (err) {
      // Handled by admin slice error state
    }
  };

  const onToggleDownloadExemption = async (user) => {
    const enabling = !user.downloadPaymentExempt;

    try {
      if (enabling) {
        setExemptionUser(user);
        setExemptionReason(user.downloadPaymentExemptReason || '');
        setExemptionUntil(
          user.downloadPaymentExemptUntil
            ? new Date(user.downloadPaymentExemptUntil).toISOString().slice(0, 10)
            : ''
        );
        setExemptionError('');
        setExemptionOpen(true);
      } else {
        await dispatch(setDownloadExemption({
          userId: user._id,
          isExempt: false,
          reason: '',
          until: '',
        })).unwrap();
        fetchUsers();
      }
    } catch (err) {
      // Handled by admin slice error state
    }
  };

  const closeExemptionDialog = () => {
    setExemptionOpen(false);
    setExemptionUser(null);
    setExemptionReason('');
    setExemptionUntil('');
    setExemptionError('');
  };

  const saveExemption = async () => {
    if (!exemptionUser?._id) return;

    if (exemptionUntil) {
      const selectedDate = new Date(`${exemptionUntil}T23:59:59`);
      if (Number.isNaN(selectedDate.getTime())) {
        setExemptionError('Enter a valid expiry date or leave it blank.');
        return;
      }

      if (selectedDate.getTime() < Date.now()) {
        setExemptionError('Expiry date must be today or later.');
        return;
      }
    }

    try {
      await dispatch(setDownloadExemption({
        userId: exemptionUser._id,
        isExempt: true,
        reason: exemptionReason,
        until: exemptionUntil,
      })).unwrap();
      closeExemptionDialog();
      fetchUsers();
    } catch (err) {
      // Handled by admin slice error state
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
      await dispatch(assignUserToSchool({
        userId: selectedUser._id,
        schoolId,
      })).unwrap();
      setAssignOpen(false);
      setSchoolId('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      // Handled by admin slice error state
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
          <IconButton aria-label="Refresh users" onClick={fetchUsers} title="Refresh">
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
              <TableCell>Download Fee</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            )}

            {users.map((u) => (
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

                <TableCell>
                  {u.role === 'teacher' ? (
                    <Typography
                      sx={{
                        color: u.downloadPaymentExempt ? 'success.main' : 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      {u.downloadPaymentExempt ? 'Exempt' : 'Charge applies'}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary">N/A</Typography>
                  )}
                </TableCell>

                <TableCell align="right">
                  {/* ✅ Only show Approve button if pending */}
                  {u.status === 'pending' && (
                    <IconButton aria-label="Approve user" onClick={() => onApproveUser(u._id)} title="Approve">
                      <CheckIcon color="success" />
                    </IconButton>
                  )}
                  {u.role !== 'admin' && u.status !== 'suspended' && (
                    <IconButton aria-label="Suspend user" onClick={() => onSuspendUser(u._id)} title="Suspend User">
                      <BlockIcon color="warning" />
                    </IconButton>
                  )}
                  {u.role !== 'admin' && u.status === 'suspended' && (
                    <IconButton aria-label="Reactivate user" onClick={() => onUnsuspendUser(u._id)} title="Reactivate User">
                      <ReplayIcon color="primary" />
                    </IconButton>
                  )}
                  <IconButton aria-label="Assign user to school" onClick={() => openAssign(u)} title="Assign to School">
                    <SchoolIcon />
                  </IconButton>
                  {u.role === 'teacher' && (
                    <Button
                      size="small"
                      variant={u.downloadPaymentExempt ? 'outlined' : 'contained'}
                      color={u.downloadPaymentExempt ? 'warning' : 'success'}
                      onClick={() => onToggleDownloadExemption(u)}
                      sx={{ mr: 1 }}
                    >
                      {u.downloadPaymentExempt ? 'Remove Exemption' : 'Exempt Download Fee'}
                    </Button>
                  )}
                  <IconButton aria-label="Delete user" onClick={() => onDeleteUser(u._id)} title="Delete">
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

      <Dialog open={exemptionOpen} onClose={closeExemptionDialog} fullWidth maxWidth="sm">
        <DialogTitle>Exempt Teacher From Download Fees</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {exemptionUser?.fullName || exemptionUser?.name} ({exemptionUser?.email})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This teacher will be allowed to download paid content without checkout until the exemption is removed or expires.
          </Typography>
          {exemptionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {exemptionError}
            </Alert>
          )}
          <TextField
            label="Reason (optional)"
            fullWidth
            multiline
            minRows={3}
            value={exemptionReason}
            onChange={(event) => setExemptionReason(event.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Expiry date (optional)"
            type="date"
            fullWidth
            value={exemptionUntil}
            onChange={(event) => setExemptionUntil(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeExemptionDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveExemption}>
            Save Exemption
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
