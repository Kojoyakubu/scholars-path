// /client/src/pages/LandingPage.jsx

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Stack, useTheme, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';

// Placeholder for a hero image or illustration
import heroImage from '/hero-illustration.svg';

// Lightweight local AI Insights card
const AIInsightsCard = ({ title = 'AI Insights', content }) => {
  if (!content) return null;
  return (
    <Paper
      sx={{ p: 3, mt: 4, borderLeft: '6px solid #6c63ff', borderRadius: 2 }}
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body1" color="text.secondary" whiteSpace="pre-line">
        {content}
      </Typography>
    </Paper>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  // 🆕 Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.fullName || 'there';
  };

  // 🆕 Redirect logged-in users to their dashboards
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
      }, 2000); // Show welcome message for 2 seconds before redirecting

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Fetch role-aware, personalized AI message if a user is logged in
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
        setAiError(err?.response?.data?.message || err?.message || 'Failed to load AI insights.');
      }
    };
    if (user) fetchInsights();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <img
            src={heroImage}
            alt="Learning Illustration"
            style={{ maxWidth: '80%', height: 'auto', marginBottom: theme.spacing(4) }}
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ color: theme.palette.primary.dark, fontWeight: 700 }}
          >
            Scholar&apos;s Path
          </Typography>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Empowering students and teachers with AI-powered, personalized learning paths and dynamic lesson creation.
          </Typography>
        </motion.div>

        {/* Show buttons only if user is NOT logged in */}
        {!user && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/register"
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
            </Stack>
          </motion.div>
        )}

        {/* Personalized AI block shows only when logged-in */}
        {user && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.6 }}>
            {aiError ? (
              <Typography color="error" sx={{ mt: 3 }}>
                {aiError}
              </Typography>
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
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default LandingPage;