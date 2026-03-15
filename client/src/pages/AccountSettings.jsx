import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { updateProfile } from '../features/auth/authSlice';

export default function AccountSettings() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth || {});

  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    const password = String(passwords.password || '');
    const confirmPassword = String(passwords.confirmPassword || '');

    if (!password) {
      setStatus({ type: 'error', message: 'Password is required.' });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      await dispatch(updateProfile({ password })).unwrap();
      setPasswords({ password: '', confirmPassword: '' });
      setStatus({ type: 'success', message: 'Password updated successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error || 'Failed to update settings.' });
    }
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your account security.
        </Typography>

        {status.message ? (
          <Alert severity={status.type === 'success' ? 'success' : 'error'} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="New Password"
              type="password"
              name="password"
              value={passwords.password}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
            />
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Update Password'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
