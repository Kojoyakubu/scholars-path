import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';

// --- MUI Imports ---
import {
  Button, TextField, FormControlLabel, Checkbox, Link, Grid, Box,
  Typography, Container, Paper, CircularProgress, Alert, Collapse
} from '@mui/material';
import { motion } from 'framer-motion';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', registerAsTeacher: false,
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      setNotification({ open: true, message: message, severity: 'error' });
    }
    if (isSuccess && message) {
      setNotification({ open: true, message: message, severity: 'success' });
      // Redirect to login after a short delay to allow the user to read the message
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    }
    // Reset the auth state when the component unmounts
    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    dispatch(register(formData));
  }, [dispatch, formData]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={4} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: '600' }}>Sign Up</Typography>
          <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3, width: '100%' }}>
            <Collapse in={notification.open}>
              <Alert severity={notification.severity} sx={{ mb: 2 }} onClose={() => setNotification({ ...notification, open: false })}>
                {notification.message}
              </Alert>
            </Collapse>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField name="fullName" required fullWidth label="Full Name" value={formData.fullName} onChange={onChange} /></Grid>
              <Grid item xs={12}><TextField name="email" required fullWidth label="Email Address" type="email" value={formData.email} onChange={onChange} /></Grid>
              <Grid item xs={12}><TextField name="password" required fullWidth label="Password" type="password" value={formData.password} onChange={onChange} /></Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox name="registerAsTeacher" checked={formData.registerAsTeacher} onChange={onChange} color="primary" />}
                  label="Register as a Teacher (Requires Admin Approval)"
                />
              </Grid>
            </Grid>
            <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item><Link component={RouterLink} to="/login" variant="body2">Already have an account? Sign in</Link></Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default Register;