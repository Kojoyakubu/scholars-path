import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Stack,
  MenuItem,
  Alert,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

import { useSelector, useDispatch } from 'react-redux';
import { login, register, reset } from '../features/auth/authSlice';

const AIInsightsCard = ({ title, content }) => {
  if (!content) return null;
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 2.5,
        borderRadius: 2,
        borderLeft: '6px solid #145A32',
        bgcolor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(6px)',
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#E8F5E9', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#E8F5E9' }}>
        {content}
      </Typography>
    </Paper>
  );
};

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'school_admin', label: 'School Admin' },
];

const AuthPortal = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [signInData, setSignInData] = useState({ email: '', password: '' });

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const [aiGreeting, setAiGreeting] = useState('');
  const [aiTitle, setAiTitle] = useState('');

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.fullName || 'there';
  };

  useEffect(() => {
    console.log('🔍 AuthPortal useEffect - isSuccess:', isSuccess, 'user:', user);
    
    if (isSuccess && user) {
      const displayName = getUserDisplayName();
      console.log('✅ User logged in:', user);
      console.log('👤 User role:', user.role);

      // Set welcome message
      setAiTitle(
        isSignUp ? `Hello, ${displayName}!` : `Welcome Back, ${displayName}!`
      );
      setAiGreeting('Redirecting you to your dashboard now...');

      const timer = setTimeout(() => {
        let targetRoute = '/';
        
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
        }
        
        console.log('🚀 Navigating to:', targetRoute);
        navigate(targetRoute, { replace: true });
      }, 1200);

      return () => {
        console.log('🧹 Cleaning up timer');
        clearTimeout(timer);
      };
    }
  }, [user, isSuccess, isSignUp, navigate, dispatch, getUserDisplayName]);

  const onRegister = (e) => {
    e.preventDefault();
    dispatch(register(signUpData));
  };

  const onLogin = (e) => {
    e.preventDefault();
    dispatch(login(signInData));
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const gradient = useMemo(
    () => 'linear-gradient(135deg, #145A32 0%, #1E8449 100%)',
    []
  );

  const slideVariants = {
    hidden: { opacity: 0, x: isSignUp ? 40 : -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0B0D0C',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={10}
          sx={{
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            background: theme.palette.mode === 'dark' ? '#101C12' : '#fff',
          }}
        >
          <Grid container>
            {/* LEFT PANEL */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                background: gradient,
                color: '#E8F5E9',
                p: { xs: 5, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: { md: 560 },
              }}
              component={motion.div}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                {isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                {isSignUp
                  ? "Enter your personal details to continue exploring Scholar's Path."
                  : 'Register with your details to enjoy AI-powered teaching and learning.'}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setIsSignUp((v) => !v);
                  dispatch(reset());
                }}
                sx={{
                  alignSelf: 'flex-start',
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: '#E8F5E9',
                  '&:hover': {
                    borderColor: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {isSignUp ? 'SIGN IN' : 'SIGN UP'}
              </Button>
              {aiGreeting && <AIInsightsCard title={aiTitle} content={aiGreeting} />}
            </Grid>

            {/* RIGHT PANEL */}
            <Grid item xs={12} md={7} sx={{ p: { xs: 4, md: 6 } }}>
              <Box
                component={motion.div}
                key={isSignUp ? 'signup' : 'signin'}
                initial="hidden"
                animate="visible"
                variants={slideVariants}
              >
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <IconButton size="small">
                    <GoogleIcon />
                  </IconButton>
                  <IconButton size="small">
                    <FacebookIcon />
                  </IconButton>
                  <IconButton size="small">
                    <GitHubIcon />
                  </IconButton>
                  <IconButton size="small">
                    <LinkedInIcon />
                  </IconButton>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  or use your email and password
                </Typography>

                {isError && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {message}
                  </Alert>
                )}

                {isSignUp ? (
                  <Box component="form" onSubmit={onRegister} sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                      <TextField
                        label="Full Name"
                        name="fullName"
                        value={signUpData.fullName}
                        onChange={handleSignUpChange}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        type="email"
                        name="email"
                        value={signUpData.email}
                        onChange={handleSignUpChange}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        required
                        fullWidth
                      />
                      <TextField
                        select
                        label="Role"
                        name="role"
                        value={signUpData.role}
                        onChange={handleSignUpChange}
                        helperText="Choose your role"
                        fullWidth
                      >
                        {roles.map((r) => (
                          <MenuItem key={r.value} value={r.value}>
                            {r.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{
                          backgroundColor: '#28B463',
                          '&:hover': { backgroundColor: '#1D8348' },
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'SIGN UP'
                        )}
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={onLogin} sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                      <TextField
                        label="Email"
                        type="email"
                        name="email"
                        value={signInData.email}
                        onChange={handleSignInChange}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={signInData.password}
                        onChange={handleSignInChange}
                        required
                        fullWidth
                      />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Forgot your password?
                        </Typography>
                      </Stack>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{
                          backgroundColor: '#28B463',
                          '&:hover': { backgroundColor: '#1D8348' },
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'SIGN IN'
                        )}
                      </Button>
                    </Stack>
                  </Box>
                )}
                <Divider sx={{ my: 3 }} />
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Typography variant="body2" color="text.secondary">
                    {isSignUp ? 'Already have an account?' : "New to Scholar's Path?"}
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => {
                      setIsSignUp((v) => !v);
                      dispatch(reset());
                    }}
                    sx={{ textTransform: 'none', color: '#1E8449' }}
                  >
                    {isSignUp ? 'Sign In' : 'Create one'}
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthPortal;