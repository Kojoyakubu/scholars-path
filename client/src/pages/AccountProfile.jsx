import React, { useEffect, useState } from 'react';
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
import { getProfile, updateProfile } from '../features/auth/authSlice';

export default function AccountProfile() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth || {});

  const [form, setForm] = useState({ fullName: '', email: '' });
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setForm({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    const payload = {
      fullName: String(form.fullName || '').trim(),
      email: String(form.email || '').trim().toLowerCase(),
    };

    if (!payload.fullName || !payload.email) {
      setStatus({ type: 'error', message: 'Full name and email are required.' });
      return;
    }

    try {
      await dispatch(updateProfile(payload)).unwrap();
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error || 'Failed to update profile.' });
    }
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update your account details used across Scholar&apos;s Path.
        </Typography>

        {status.message ? (
          <Alert severity={status.type === 'success' ? 'success' : 'error'} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
