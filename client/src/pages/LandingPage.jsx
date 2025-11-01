// /client/src/pages/LandingPage.jsx

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Stack, useTheme, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios'; // axios instance

// Placeholder for a hero image or illustration
import heroImage from '/hero-illustration.svg'; // You'll need an SVG or PNG here

// Lightweight local AI Insights card (kept inline so this file is self-contained)
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
  const { user } = useSelector((state) => state.auth || {});
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  // Fetch role-aware, personalized AI message if a user is logged in
  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        // Backend can personalize using req.user (JWT). We also pass hints.
        // ✅ CORRECTED URL
        const res = await api.get('/api/ai/onboarding/insights', {
          params: { role: user?.role, name: user?.fullName },
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
            src={heroImage} // Ensure you have a hero-illustration.svg in your public folder
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

        {/* Personalized AI block shows only when logged-in */}
        {user && (
          <>
            {aiError ? (
              <Typography color="error" sx={{ mt: 3 }}>
                {aiError}
              </Typography>
            ) : (
              <AIInsightsCard
                title={
                  user.role === 'teacher'
                    ? `Welcome back, ${user.fullName}!`
                    : user.role === 'admin'
                    ? `Hello Admin ${user.fullName}`
                    : user.role === 'school_admin'
                    ? `Hello ${user.fullName} (School Admin)`
                    : `Hi ${user.fullName}`
                }
                content={aiInsights}
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default LandingPage;