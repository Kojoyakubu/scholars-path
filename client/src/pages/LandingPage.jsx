// /client/src/pages/LandingPage.jsx
// 🎨 Modernized Landing Page - Following Design Blueprint
// Features: Split layout, gradient hero, animated elements, trust badges, feature grid

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';

// Icons for features
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';

// 🎯 Animation Variants - Smooth, subtle animations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } 
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.8, ease: 'easeOut' } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// 🎴 AI Insights Card Component - Purple gradient accent
const AIInsightsCard = ({ title = 'AI Insights', content }) => {
  const theme = useTheme();
  
  if (!content) return null;
  
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      sx={{
        p: 4,
        mt: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
        border: '2px solid',
        borderColor: alpha(theme.palette.secondary.main, 0.3),
        position: 'relative',
        overflow: 'hidden',
        // Animated gradient border effect
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: theme.palette.background.aiGradient,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: theme.palette.background.aiGradient,
            boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
          }}
        >
          <AutoAwesomeIcon />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="body1" 
        sx={{ 
          color: theme.palette.text.primary,
          lineHeight: 1.8,
          whiteSpace: 'pre-line'
        }}
      >
        {content}
      </Typography>
    </Paper>
  );
};

// 🎴 Feature Card Component - Hover lift effect
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => {
  const theme = useTheme();
  
  return (
    <Grid item xs={12} md={4}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ delay }}
      >
        <Paper
          sx={{
            p: 4,
            height: '100%',
            textAlign: 'center',
            background: alpha(color, 0.05),
            border: `1px solid ${alpha(color, 0.1)}`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 20px 40px ${alpha(color, 0.2)}`,
              border: `1px solid ${alpha(color, 0.3)}`,
            },
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
              boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {description}
          </Typography>
        </Paper>
      </motion.div>
    </Grid>
  );
};

// 🏠 Main Landing Page Component
const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  // 🆕 Helper function to get user's display name (preserved from original)
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.fullName || 'there';
  };

  // 🆕 Redirect logged-in users to their dashboards after showing welcome message (preserved logic)
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
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
            break;
        }
      }, 2000); // Show welcome message for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // 🤖 Fetch personalized AI insights for logged-in users (API call preserved)
  useEffect(() => {
    let isMounted = true;
    
    const fetchInsights = async () => {
      try {
        const res = await api.get('/api/ai/onboarding/insights', {
          params: { role: user?.role, name: getUserDisplayName() },
        });
        if (!isMounted) return;
        
        const text = res?.data?.insight || res?.data?.message || '';
        setAiInsights(text);
      } catch (err) {
        if (!isMounted) return;
        setAiError(
          err?.response?.data?.message || 
          err?.message || 
          'Failed to load AI insights.'
        );
      }
    };
    
    if (user) fetchInsights();
    
    return () => { isMounted = false; };
  }, [user]);

  // 📊 Feature data for feature grid
  const features = [
    {
      icon: AutoAwesomeIcon,
      title: 'AI-Powered Learning',
      description: 'Personalized lesson plans and quizzes generated by advanced AI to match each student\'s pace and style.',
      color: theme.palette.secondary.main,
      delay: 0,
    },
    {
      icon: SchoolIcon,
      title: 'Comprehensive Curriculum',
      description: 'Access to full educational curriculums aligned with standards, covering all major subjects and grades.',
      color: theme.palette.primary.main,
      delay: 0.1,
    },
    {
      icon: SpeedIcon,
      title: 'Real-Time Progress',
      description: 'Track student performance with detailed analytics and insights to identify strengths and areas for improvement.',
      color: theme.palette.success.main,
      delay: 0.2,
    },
    {
      icon: TrendingUpIcon,
      title: 'Adaptive Learning',
      description: 'Dynamic content that adjusts difficulty based on student performance for optimal learning outcomes.',
      color: theme.palette.warning.main,
      delay: 0.3,
    },
    {
      icon: GroupsIcon,
      title: 'Collaborative Tools',
      description: 'Foster collaboration between teachers, students, and administrators with integrated communication features.',
      color: theme.palette.info.main,
      delay: 0.4,
    },
    {
      icon: SecurityIcon,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security protecting student data with encrypted storage and secure authentication.',
      color: theme.palette.error.main,
      delay: 0.5,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* 🎨 Hero Section - Gradient background with animated elements */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '90vh',
          background: theme.palette.background.gradient,
          color: 'white',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          // Animated floating shapes in background
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: alpha('#60A5FA', 0.1),
            top: '-250px',
            right: '-250px',
            animation: 'float 20s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: alpha('#8B5CF6', 0.1),
            bottom: '-150px',
            left: '-150px',
            animation: 'float 15s ease-in-out infinite reverse',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0) translateX(0)' },
            '50%': { transform: 'translateY(-30px) translateX(30px)' },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left Side - Copy */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: alpha('#FFFFFF', 0.9),
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    MODERN EDUCATION PLATFORM
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      color: '#FFFFFF',
                      textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Scholar's Path
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      color: alpha('#FFFFFF', 0.95),
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    Empowering students and teachers with AI-powered, personalized 
                    learning paths and dynamic lesson creation.
                  </Typography>
                </motion.div>

                {/* Show CTA buttons only for non-logged-in users */}
                {!user && (
                  <motion.div variants={fadeInUp}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        to="/register"
                        sx={{
                          bgcolor: '#FFFFFF',
                          color: theme.palette.primary.dark,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            bgcolor: alpha('#FFFFFF', 0.9),
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 32px rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        Get Started Free
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/login"
                        sx={{
                          borderColor: '#FFFFFF',
                          color: '#FFFFFF',
                          borderWidth: 2,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#FFFFFF',
                            bgcolor: alpha('#FFFFFF', 0.1),
                          },
                        }}
                      >
                        Sign In
                      </Button>
                    </Stack>
                  </motion.div>
                )}
              </motion.div>
            </Grid>

            {/* Right Side - Auth Card or Welcome Message */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {user ? (
                  // Show personalized welcome message for logged-in users
                  <Box>
                    {aiError ? (
                      <Paper
                        sx={{
                          p: 4,
                          bgcolor: alpha('#FFFFFF', 0.1),
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <Typography color="error.light" variant="body1">
                          {aiError}
                        </Typography>
                      </Paper>
                    ) : (
                      <AIInsightsCard
                        title={
                          user.role === 'teacher'
                            ? `Welcome Back, ${getUserDisplayName()}!`
                            : user.role === 'admin'
                            ? `Hello Admin ${getUserDisplayName()}`
                            : user.role === 'school_admin'
                            ? `Hello ${getUserDisplayName()} (School Admin)`
                            : `Welcome Back, ${getUserDisplayName()}!`
                        }
                        content={aiInsights || 'Redirecting you to your dashboard now...'}
                      />
                    )}
                  </Box>
                ) : (
                  // Decorative illustration placeholder for non-logged-in users
                  <Box
                    sx={{
                      width: '100%',
                      height: 400,
                      bgcolor: alpha('#FFFFFF', 0.1),
                      borderRadius: 4,
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 120, color: alpha('#FFFFFF', 0.3) }} />
                  </Box>
                )}
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 🏆 Trust Badges Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            justifyContent="center"
            alignItems="center"
            sx={{ textAlign: 'center' }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                500+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schools Enrolled
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                50K+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Students
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>
                98%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Satisfaction Rate
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      </Container>

      {/* 🌟 Features Grid Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Typography
            variant="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 2, fontWeight: 700 }}
          >
            Everything You Need to Succeed
          </Typography>
          <Typography
            variant="subtitle1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Comprehensive tools and features designed to enhance learning experiences 
            for students, teachers, and administrators.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </Grid>
      </Container>

      {/* 🚀 Final CTA Section (only for non-logged-in users) */}
      {!user && (
        <Box
          sx={{
            py: 10,
            background: theme.palette.background.gradient,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Ready to Transform Education?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, color: alpha('#FFFFFF', 0.9) }}>
                Join thousands of educators and students already using Scholar's Path.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{
                  bgcolor: '#FFFFFF',
                  color: theme.palette.primary.dark,
                  px: 5,
                  py: 2,
                  fontSize: '1.125rem',
                  '&:hover': {
                    bgcolor: alpha('#FFFFFF', 0.9),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Start Your Free Trial
              </Button>
            </motion.div>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;