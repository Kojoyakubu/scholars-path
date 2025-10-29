// /client/src/pages/TeacherDashboard.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../api/axios';

// Utility to color keywords dynamically
const highlightKeywords = (text) => {
  if (!text) return '';
  const patterns = [
    { regex: /\b(excellent|great|outstanding|improved?)\b/gi, color: '#2E7D32' }, // earthy green
    { regex: /\b(needs improvement|consider|could|attention)\b/gi, color: '#CDAA00' }, // deep gold
    { regex: /\b(recommended|suggests?|next step|ai)\b/gi, color: '#003366' }, // dark blue
  ];
  let result = text;
  patterns.forEach(({ regex, color }) => {
    result = result.replace(regex, (match) => `<span style="color:${color};font-weight:600">${match}</span>`);
  });
  return result;
};

// Inline AI Insights card with animated reveal
const AIInsightsCard = ({ title, content }) => {
  if (!content) return null;
  return (
    <Paper
      sx={{ p: 3, mt: 4, borderLeft: '6px solid #2E7D32', borderRadius: 2, bgcolor: '#f9faf8' }}
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#003366', fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1 }}
        dangerouslySetInnerHTML={{ __html: highlightKeywords(content) }}
      />
    </Paper>
  );
};

const TeacherDashboard = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth || {});
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  // Fetch dashboard metrics
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/teacher/dashboard');
        if (isMounted) setDashboardData(res.data);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Fetch AI insights
  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        const res = await api.get('/api/teacher/insights', {
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

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading your dashboard…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Teacher Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Welcome back, {user?.fullName || 'Teacher'} — here’s a quick look at your teaching stats.
        </Typography>

        {/* Dashboard Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">Lesson Notes</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.lessonNotes ?? 0}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">Quizzes Created</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.quizzes ?? 0}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">Student Engagement</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.engagementRate ?? '0%'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">AI Lessons Generated</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.aiLessons ?? 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* AI Insights Section */}
        {user && (
          <>
            {aiError ? (
              <Typography color="error" sx={{ mt: 3 }}>
                {aiError}
              </Typography>
            ) : (
              <AIInsightsCard
                title={`Your Teaching Highlights, ${user.fullName || 'Teacher'}`}
                content={
                  aiInsights ||
                  `Analyzing your recent activities and engagement data...`
                }
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default TeacherDashboard;
