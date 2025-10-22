import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice';

// MUI Imports
import {
  Button, TextField, Box, Typography, Container, Paper,
  CircularProgress, Alert, Collapse, Link, Grid // ✅ THE FIX IS HERE: Added 'Grid' to the import list
} from '@mui/material';
import { motion } from 'framer-motion';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      // Error is handled by the notification state
    }

    if (isSuccess && user) {
      // Check the user's role and navigate to the correct dashboard
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'teacher':
        case 'school_admin':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/dashboard');
          break;
        default:
          navigate('/'); // Fallback to landing page if role is unknown
      }
    }

    // Reset the auth state flags when the component unmounts
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    dispatch(login(formData));
  }, [dispatch, formData]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <Container component="main" maxWidth="xs">
        <Paper
          component={motion.div}
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          elevation={4}
          sx={{
            marginTop: 8,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ fontWeight: '600', mb: 1 }}>
            Sign In
          </Typography>

          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <Collapse in={isError}>
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {message}
              </Alert>
            </Collapse>

            <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={formData.email} onChange={onChange} />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={formData.password} onChange={onChange} />
            
            <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default Login;