// /client/src/pages/Register.jsx
// ✨ Enhanced Register Page - FIXED TEXT CONTRAST
// Beautiful • User-friendly • Professional

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  Person,
  Email,
  Lock,
  ArrowForward,
  CheckCircle,
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

import { register, googleAuth } from '../features/auth/authSlice';

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  
  const [showPassword, setShowPassword] = useState(false);
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
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(formData.password)) {
      errors.password = 'Use uppercase, lowercase, number, and special character';
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
      const resultAction = await dispatch(register(formData));
      
      if (register.fulfilled.match(resultAction)) {
        const payload = resultAction.payload || {};
        const successMessage =
          payload.message ||
          'Registration successful. Please check your email for verification before logging in.';

        navigate('/login', {
          replace: true,
          state: { message: successMessage },
        });
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setLocalNotice('Google sign-up failed. Please try again.');
      return;
    }

    const resultAction = await dispatch(
      googleAuth({
        credential: credentialResponse.credential,
        mode: 'register',
        role: formData.role,
      })
    );

    if (!googleAuth.fulfilled.match(resultAction)) {
      return;
    }

    const payload = resultAction.payload;

    if (payload?.requires2FA) {
      setLocalNotice(payload.message || 'Two-factor authentication is required for this account.');
      return;
    }

    if (!payload?.role) {
      navigate('/login', {
        replace: true,
        state: {
          message: payload?.message || 'Google registration completed. Please continue to login.',
        },
      });
      return;
    }

    if (payload.role === 'student') {
      navigate('/student/select-class');
    } else if (payload.role === 'teacher' || payload.role === 'school_admin') {
      navigate('/teacher/dashboard');
    } else if (payload.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleGoogleError = () => {
    setLocalNotice('Google sign-up was cancelled or failed. Please try again.');
  };

  const handleSocialAuth = async (provider) => {
    const result = await startSocialOAuth({
      provider,
      mode: 'register',
      role: formData.role,
    });

    if (!result?.ok) {
      setLocalNotice(result?.message || `${provider} sign-up is not configured.`);
    }
  };

  const features = [
    'Create Personalized Learning Paths',
    'Generate AI-Powered Quizzes',
    'Track Student Progress',
    'Access Comprehensive Curriculum',
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
          background: theme.palette.primary.main,
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
              Lernex
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
            Join Lernex
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: 'rgba(255, 255, 255, 0.9)', // ✅ FIXED: White with 90% opacity
            }}
          >
            Start Your Learning Journey Today
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
                src="/undraw_online-test_cqv0.svg"
                alt="Welcome to Lernex"
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

      {/* Right Side - Registration Form */}
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
                  <Person sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign up to get started with Lernex
                </Typography>
              </Box>

              {/* Error Alert */}
              {isError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

              {localNotice && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  {localNotice}
                </Alert>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
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
                  helperText={
                    validationErrors.password || 'Min 8 chars with upper, lower, number, and special char'
                  }
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

                {/* Role Selection */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Register As</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Register As"
                    disabled={isLoading}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                  </Select>
                </FormControl>

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
                  {isLoading ? 'Creating Account...' : 'Create Account'}
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
                          title={isConfigured ? `Sign up with ${label}` : `${label} — coming soon`}
                        >
                          <span>
                            <IconButton
                              aria-label={`Sign up with ${label}`}
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

                {/* Sign In Link */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: 'primary.main',
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
                Lernex
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Register;