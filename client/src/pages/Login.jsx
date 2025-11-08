// /client/src/pages/Login.jsx
// 🎨 Modernized Login Page - Following Design Blueprint
// Features: Split-screen layout, brand illustration, floating labels, social login ready

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice';

// MUI Imports
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Collapse,
  Link,
  Grid,
  useTheme,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

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

function Login() {
  const theme = useTheme();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  // 🔄 Handle authentication success and redirects (preserved logic)
  useEffect(() => {
    if (isError) {
      console.log('❌ Login error:', message);
    }

    if (isSuccess && user) {
      console.log('✅ Login successful, user:', user);
      
      // Determine target route based on role (preserved logic)
      let targetRoute;
      switch (user.role) {
        case 'admin':
          targetRoute = '/admin';
          break;
        case 'teacher':
        case 'school_admin':
          targetRoute = '/teacher/dashboard';
          break;
        case 'student':
          targetRoute = '/dashboard';
          break;
        default:
          targetRoute = '/dashboard';
          console.warn('⚠️ Unknown role, defaulting to /dashboard');
      }
      
      console.log('🚀 Redirecting to:', targetRoute);
      
      // Use replace instead of push to avoid going back to login (preserved logic)
      navigate(targetRoute, { replace: true });
    }

    // Cleanup function (preserved logic)
    return () => {
      if (isSuccess) {
        dispatch(reset());
      }
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  // 📝 Form handlers (preserved logic)
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('📤 Submitting login...');
    dispatch(login(formData));
  }, [dispatch, formData]);

  // 🔄 Show loading spinner during redirect (preserved logic)
  if (isSuccess && user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Benefits to display on left panel
  const benefits = [
    'AI-Powered Learning Paths',
    'Real-Time Progress Tracking',
    'Collaborative Tools',
    'Secure & Reliable Platform',
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 4, md: 8 },
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
                Scholar's Path
              </Typography>
              <Typography variant="h6" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                Transform Education with AI
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
                [Hero Illustration]
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

        {/* 📝 Right Panel - Login Form */}
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
                  <LockOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to continue to Scholar's Path
                </Typography>
              </Box>

              {/* Error Alert */}
              <Collapse in={isError}>
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  onClose={() => dispatch(reset())}
                >
                  {message}
                </Alert>
              </Collapse>

              {/* Login Form */}
              <Box component="form" onSubmit={onSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={onChange}
                  disabled={isLoading}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={onChange}
                  disabled={isLoading}
                  sx={{ mb: 3 }}
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
                    'Sign In'
                  )}
                </Button>

                {/* Divider */}
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Social Login Placeholder */}
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
                    Continue with Google (Coming Soon)
                  </Button>
                </Stack>

                {/* Footer Links */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Sign Up
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

export default Login;