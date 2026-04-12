// /client/src/pages/Login.jsx
// ✨ Enhanced Login Page - FIXED TEXT CONTRAST
// Beautiful • User-friendly • Professional

import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  Link,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  Email,
  Lock,
  ArrowForward,
  CheckCircle,
  LockOpen,
  Facebook,
  GitHub,
  LinkedIn,
} from '@mui/icons-material';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { startSocialOAuth, isSocialProviderConfigured } from '../utils/socialOAuth';

const SOCIAL_PROVIDERS = [
  { id: 'facebook', label: 'Facebook', icon: <Facebook fontSize="small" /> },
  { id: 'github',   label: 'GitHub',   icon: <GitHub fontSize="small" /> },
  { id: 'linkedin', label: 'LinkedIn', icon: <LinkedIn fontSize="small" /> },
  { id: 'tiktok',  label: 'TikTok',   icon: <FaTiktok size={16} /> },
  { id: 'x',       label: 'X',        icon: <FaXTwitter size={16} /> },
];

import { login, googleAuth } from '../features/auth/authSlice';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localNotice, setLocalNotice] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const resultAction = await dispatch(login(formData));
      
      if (login.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;

        if (payload?.requires2FA) {
          setLocalNotice(
            payload.message ||
              'Two-factor authentication is enabled for this account. Please complete 2FA in the next step.'
          );
          return;
        }

        const user = payload;
        
        // Navigate based on role
        if (user.role === 'student') {
          navigate('/student/select-class');
        } else if (user.role === 'teacher' || user.role === 'school_admin') {
          navigate('/teacher/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setLocalNotice('Google login failed. Please try again.');
      return;
    }

    const resultAction = await dispatch(
      googleAuth({ credential: credentialResponse.credential, mode: 'login' })
    );

    if (!googleAuth.fulfilled.match(resultAction)) {
      return;
    }

    const payload = resultAction.payload;

    if (payload?.requires2FA) {
      setLocalNotice(payload.message || 'Two-factor authentication is required for this account.');
      return;
    }

    const user = payload;
    if (!user?.role) {
      setLocalNotice(payload?.message || 'Authentication completed. Please contact support if access is pending.');
      return;
    }

    if (user.role === 'student') {
      navigate('/student/select-class');
    } else if (user.role === 'teacher' || user.role === 'school_admin') {
      navigate('/teacher/dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleGoogleError = () => {
    setLocalNotice('Google login was cancelled or failed. Please try again.');
  };

  const handleSocialAuth = async (provider) => {
    const result = await startSocialOAuth({
      provider,
      mode: 'login',
      role: 'student',
    });

    if (!result?.ok) {
      setLocalNotice(result?.message || `${provider} sign-in is not configured.`);
    }
  };

  const features = [
    'AI-Powered Learning Paths',
    'Real-Time Progress Tracking',
    'Collaborative Tools',
    'Secure & Reliable Platform',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: alpha(theme.palette.primary.main, 0.05),
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: '38%',
          minHeight: '100vh',
          background: theme.palette.primary.dark,
          p: { md: 3.5, lg: 4.5 },
          color: 'white', // ✅ FIXED: Ensure all text is white
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3.5 }}>
            <School sx={{ fontSize: 40, mr: 2, color: 'white' }} /> {/* ✅ Explicit white */}
            <Typography
              variant="h4"
              sx={{ 
                fontWeight: 800,
                color: 'white', // ✅ FIXED: Explicit white color
              }}
            >
              Scholar's Path
            </Typography>
          </Box>

          {/* Tagline */}
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              color: 'white', // ✅ FIXED: Explicit white color
            }}
          >
            Scholar's Path
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: 'rgba(255, 255, 255, 0.9)', // ✅ FIXED: White with 90% opacity
            }}
          >
            Transform Education with AI
          </Typography>

          {/* Illustration Placeholder */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              py: 2.5,
              borderRadius: 3,
              background: alpha('#ffffff', 0.1),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#ffffff', 0.2)}`,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                mb: 0,
                background: alpha('#ffffff', 0.1),
                p: 1.5,
              }}
            >
              <img
                src="/hero-illustration.svg"
                alt="Welcome to Scholar's Path"
                style={{
                  width: '100%',
                  maxHeight: '220px',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 12,
                }}
              />
            </Box>
          </Paper>

          {/* Features List */}
          <Box>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1.1,
                  }}
                >
                  <CheckCircle sx={{ mr: 2, fontSize: 20, color: 'white' }} /> {/* ✅ FIXED */}
                  <Typography 
                    variant="body2"
                    sx={{ color: 'white', fontSize: '0.9rem' }} // ✅ FIXED: Explicit white color
                  >
                    {feature}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 3,
                background: alpha('#ffffff', 0.9),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    mb: 2,
                  }}
                >
                  <LockOpen sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to continue to Scholar's Path
                </Typography>
              </Box>

              {/* Error Alert */}
              {location.state?.message && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {location.state.message}
                </Alert>
              )}

              {localNotice && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  {localNotice}
                </Alert>
              )}

              {isError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  disabled={isLoading}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Password */}
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Remember Me & Forgot Password */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  endIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <ArrowForward />
                    )
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: `0 4px 14px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                    },
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Divider */}
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1.5 }}>
                    Continue with social account
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.2 }}>
                    {SOCIAL_PROVIDERS.map(({ id, label, icon }) => {
                      const isConfigured = isSocialProviderConfigured(id);
                      return (
                        <Tooltip
                          key={id}
                          title={isConfigured ? `Sign in with ${label}` : `${label} — coming soon`}
                        >
                          <span>
                            <IconButton
                              aria-label={`Sign in with ${label}`}
                              onClick={() => handleSocialAuth(id)}
                              disabled={!isConfigured}
                              sx={{
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                bgcolor: alpha('#FFFFFF', 0.8),
                                opacity: isConfigured ? 1 : 0.4,
                              }}
                            >
                              {icon}
                            </IconButton>
                          </span>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>

                {/* Sign Up Link */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: 'primary.main',
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
              </form>
            </Paper>

            {/* Mobile Logo */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                alignItems: 'center',
                mt: 3,
              }}
            >
              <School sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: 'primary.main' }}
              >
                Scholar's Path
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;