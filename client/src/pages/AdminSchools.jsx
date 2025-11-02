// /client/src/pages/AdminSchools.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';
import adminService from '../features/admin/adminService';

const AdminSchools = () => {
  const [rows, setRows] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // 🔄 Fetch all schools
  const fetchSchools = async () => {
    try {
      const data = await adminService.getSchools();
      setRows(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // ➕ Create new school
  const createSchool = async () => {
    try {
      await adminService.createSchool({ name: schoolName, adminEmail });
      setCreateOpen(false);
      setSchoolName('');
      setAdminEmail('');
      fetchSchools();
    } catch (error) {
      console.error('Error creating school:', error);
    }
  };

  // ❌ Delete school
  const deleteSchool = async (id) => {
    try {
      await adminService.deleteSchool(id);
      fetchSchools();
    } catch (error) {
      console.error('Error deleting school:', error);
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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            School Management
          </Typography>
          <IconButton onClick={fetchSchools} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setCreateOpen(true)}
          >
            New School
          </Button>
        </Box>

        {/* School Table */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>School Name</TableCell>
              <TableCell>Admin Email</TableCell>
              <TableCell>Teachers</TableCell>
              <TableCell>Students</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">
                    No schools found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.admin?.email || '—'}</TableCell>
                  <TableCell>{s.teacherCount ?? 0}</TableCell>
                  <TableCell>{s.studentCount ?? 0}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => deleteSchool(s._id)}
                      title="Delete"
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create School Modal */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New School</DialogTitle>
        <DialogContent>
          <TextField
            label="School Name"
            fullWidth
            sx={{ mt: 2 }}
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <TextField
            label="Admin Email"
            type="email"
            fullWidth
            sx={{ mt: 2 }}
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            helperText="An admin account will be generated for this email."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={createSchool}
            variant="contained"
            disabled={!schoolName || !adminEmail}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSchools;
