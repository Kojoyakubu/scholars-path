// /client/src/pages/Register.jsx
// 🎨 Modernized Register Page - Following Design Blueprint  
// Features: Split-screen layout, password strength indicator, smooth animations

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';

// MUI Imports
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Collapse,
  useTheme,
  alpha,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// 🎯 Animation Variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

// 🔒 Password Strength Indicator Component
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    let label = 'Weak';
    let color = 'error';
    if (strength >= 70) {
      label = 'Strong';
      color = 'success';
    } else if (strength >= 50) {
      label = 'Medium';
      color = 'warning';
    }
    
    return { strength, label, color };
  };

  const { strength, label, color } = getStrength();

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600,
            color: color === 'error' ? 'error.main' : color === 'warning' ? 'warning.main' : 'success.main'
          }}
        >
          {label}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        color={color}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

function Register() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    registerAsTeacher: false,
  });
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  // 🔄 Handle registration success and errors (preserved logic)
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
    // Reset the auth state when the component unmounts (preserved logic)
    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  // 📝 Form handlers (preserved logic)
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

  // Benefits to display on left panel
  const benefits = [
    'Create Personalized Learning Paths',
    'Generate AI-Powered Quizzes',
    'Track Student Progress',
    'Access Comprehensive Curriculum',
  ];

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={fadeIn}
      style={{ minHeight: '100vh', display: 'flex' }}
    >
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* 🎨 Left Panel - Brand & Benefits */}
        <Grid
          item
          xs={12}
          md={6}
          component={motion.div}
          variants={slideInLeft}
          sx={{
            background: theme.palette.background.gradient,
            color: 'white',
            display: { xs: 'none', md: 'flex' }, // Hide on mobile to save space
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 8,
            position: 'relative',
            overflow: 'hidden',
            // Animated background shapes
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: alpha('#60A5FA', 0.1),
              top: '-200px',
              right: '-200px',
              animation: 'float 15s ease-in-out infinite',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-30px)' },
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
            {/* Logo & Title */}
            <Box sx={{ mb: 4 }}>
              <SchoolIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Join Scholar's Path
              </Typography>
              <Typography variant="h6" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                Start Your Learning Journey Today
              </Typography>
            </Box>

            {/* Illustration Placeholder */}
            <Box
              sx={{
                width: '100%',
                height: 250,
                bgcolor: alpha('#FFFFFF', 0.1),
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                [Registration Illustration]
              </Typography>
            </Box>

            {/* Benefits List */}
            <Stack spacing={2} alignItems="flex-start" sx={{ textAlign: 'left' }}>
              {benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon sx={{ color: theme.palette.success.light }} />
                  <Typography variant="body1">{benefit}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* 📝 Right Panel - Registration Form */}
        <Grid
          item
          xs={12}
          md={6}
          component={motion.div}
          variants={slideInRight}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: theme.palette.background.default,
            p: { xs: 3, md: 4 },
          }}
        >
          <Container component="main" maxWidth="sm">
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                bgcolor: 'white',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Form Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: theme.palette.background.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <PersonAddIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign up to get started with Scholar's Path
                </Typography>
              </Box>

              {/* Notification Alert */}
              <Collapse in={notification.open}>
                <Alert 
                  severity={notification.severity} 
                  sx={{ mb: 3 }}
                  onClose={() => setNotification({ ...notification, open: false })}
                >
                  {notification.message}
                </Alert>
              </Collapse>

              {/* Registration Form */}
              <Box component="form" noValidate onSubmit={onSubmit}>
                <TextField
                  name="fullName"
                  required
                  fullWidth
                  label="Full Name"
                  autoFocus
                  value={formData.fullName}
                  onChange={onChange}
                  disabled={isLoading}
                  sx={{ mb: 2 }}
                />

                <TextField
                  name="email"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={onChange}
                  disabled={isLoading}
                  sx={{ mb: 2 }}
                />

                <TextField
                  name="password"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={onChange}
                  disabled={isLoading}
                  sx={{ mb: 1 }}
                />

                {/* Password Strength Indicator */}
                <PasswordStrength password={formData.password} />

                {/* Teacher Registration Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      name="registerAsTeacher"
                      checked={formData.registerAsTeacher}
                      onChange={onChange}
                      color="primary"
                      disabled={isLoading}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Register as a Teacher (Requires Admin Approval)
                    </Typography>
                  }
                  sx={{ mt: 2, mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  size="large"
                  sx={{ mb: 2 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                {/* Divider */}
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Social Registration Placeholder */}
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled
                    sx={{
                      py: 1.5,
                      color: 'text.secondary',
                      borderColor: 'divider',
                    }}
                  >
                    Sign up with Google (Coming Soon)
                  </Button>
                </Stack>

                {/* Footer Links */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default Register;