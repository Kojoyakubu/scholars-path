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
  Snackbar,
  Alert,
  MenuItem,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { getSchools, createSchool, deleteSchool, updateSchoolTermCalendar } from '../features/admin/adminSlice';

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const normalizeWeekRows = (rows = []) => {
  return [...rows]
    .filter((row) => row.weekNumber && row.weekEnding)
    .map((row) => ({ weekNumber: Number(row.weekNumber), weekEnding: row.weekEnding }))
    .sort((a, b) => a.weekNumber - b.weekNumber);
};

const AdminSchools = () => {
  const dispatch = useDispatch();
  const { schools, isLoading } = useSelector((state) => state.admin);

  const [createOpen, setCreateOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarSchoolId, setCalendarSchoolId] = useState('');
  const [calendarTerm, setCalendarTerm] = useState('one');
  const [weekRows, setWeekRows] = useState([]);
  const [weekCount, setWeekCount] = useState(12);

  const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

  // 🔄 Fetch all schools
  const fetchSchools = async () => {
    try {
      await dispatch(getSchools()).unwrap();
    } catch (error) {
      setAlert({ open: true, type: 'error', message: 'Failed to load schools.' });
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // ➕ Create new school
  const onCreateSchool = async () => {
    try {
      await dispatch(createSchool({
        name: schoolName,
        adminName,
        adminEmail,
        adminPassword,
      })).unwrap();
      setAlert({ open: true, type: 'success', message: 'School created successfully!' });
      setCreateOpen(false);
      setSchoolName('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      fetchSchools();
    } catch (error) {
      console.error('Error creating school:', error);
      setAlert({
        open: true,
        type: 'error',
        message:
          error.response?.data?.message ||
          'Failed to create school. Please check input fields.',
      });
    }
  };

  // ❌ Delete school
  const onDeleteSchool = async (id) => {
    try {
      await dispatch(deleteSchool(id)).unwrap();
      setAlert({ open: true, type: 'success', message: 'School deleted successfully!' });
      fetchSchools();
    } catch (error) {
      setAlert({ open: true, type: 'error', message: 'Failed to delete school.' });
    }
  };

  const openCalendarEditor = (school) => {
    const rows = school?.termCalendar?.[calendarTerm] || [];
    setCalendarSchoolId(school?._id || '');
    setWeekRows(rows.map((row) => ({
      weekNumber: row.weekNumber,
      weekEnding: toDateInputValue(row.weekEnding),
    })));
    setWeekCount(rows.length || 12);
    setCalendarOpen(true);
  };

  const handleTermChange = (term) => {
    setCalendarTerm(term);
    const school = schools.find((item) => item._id === calendarSchoolId);
    const rows = school?.termCalendar?.[term] || [];
    setWeekRows(rows.map((row) => ({
      weekNumber: row.weekNumber,
      weekEnding: toDateInputValue(row.weekEnding),
    })));
    setWeekCount(rows.length || 12);
  };

  const regenerateWeekRows = (countValue) => {
    const count = Math.max(1, Math.min(20, Number(countValue) || 1));
    setWeekCount(count);
    setWeekRows((prev) => Array.from({ length: count }, (_, index) => {
      const current = prev[index] || {};
      return {
        weekNumber: index + 1,
        weekEnding: current.weekEnding || '',
      };
    }));
  };

  const handleWeekEndingChange = (index, value) => {
    setWeekRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], weekNumber: index + 1, weekEnding: value };
      return next;
    });
  };

  const onSaveTermCalendar = async () => {
    const school = schools.find((item) => item._id === calendarSchoolId);
    if (!school) return;

    const currentCalendar = school.termCalendar || { one: [], two: [], three: [] };
    const nextCalendar = {
      one: normalizeWeekRows(currentCalendar.one || []),
      two: normalizeWeekRows(currentCalendar.two || []),
      three: normalizeWeekRows(currentCalendar.three || []),
      [calendarTerm]: normalizeWeekRows(weekRows),
    };

    try {
      await dispatch(updateSchoolTermCalendar({ schoolId: calendarSchoolId, termCalendar: nextCalendar })).unwrap();
      setAlert({ open: true, type: 'success', message: 'Term calendar updated successfully!' });
      setCalendarOpen(false);
      fetchSchools();
    } catch (_error) {
      setAlert({ open: true, type: 'error', message: 'Failed to save term calendar.' });
    }
  };

  // 🧹 Close snackbar
  const handleCloseAlert = () => setAlert({ ...alert, open: false });

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
          <IconButton aria-label="Refresh schools" onClick={fetchSchools} title="Refresh">
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
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">
                    {isLoading ? 'Loading...' : 'No schools found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.admin?.email || '—'}</TableCell>
                  <TableCell>{s.teacherCount ?? 0}</TableCell>
                  <TableCell>{s.studentCount ?? 0}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="Edit term calendar"
                      onClick={() => openCalendarEditor(s)}
                      title="Edit term calendar"
                    >
                      <CalendarMonthIcon color="primary" />
                    </IconButton>
                    <IconButton
                      aria-label="Delete school"
                      onClick={() => onDeleteSchool(s._id)}
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

      {/* ➕ Create School Dialog */}
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
            label="Admin Name"
            fullWidth
            sx={{ mt: 2 }}
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
          />
          <TextField
            label="Admin Email"
            type="email"
            fullWidth
            sx={{ mt: 2 }}
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            helperText="An admin account will be created for this email."
          />
          <TextField
            label="Admin Password"
            type="password"
            fullWidth
            sx={{ mt: 2 }}
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            helperText="Password for the school's admin account."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={onCreateSchool}
            variant="contained"
            disabled={!schoolName || !adminName || !adminEmail || !adminPassword}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Set Term Weeks and Week Endings</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Term"
            value={calendarTerm}
            onChange={(e) => handleTermChange(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="one">Term One</MenuItem>
            <MenuItem value="two">Term Two</MenuItem>
            <MenuItem value="three">Term Three</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Number of Weeks"
            value={weekCount}
            onChange={(e) => regenerateWeekRows(e.target.value)}
            inputProps={{ min: 1, max: 20 }}
            sx={{ mt: 2 }}
          />

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {weekRows.map((row, index) => (
              <TextField
                key={`week-ending-${index}`}
                fullWidth
                type="date"
                label={`Week ${index + 1} Ending`}
                value={row.weekEnding || ''}
                onChange={(e) => handleWeekEndingChange(index, e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarOpen(false)}>Cancel</Button>
          <Button onClick={onSaveTermCalendar} variant="contained">Save Calendar</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar for feedback */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.type}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSchools;
