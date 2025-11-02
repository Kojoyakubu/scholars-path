import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Paper,
  CircularProgress, Divider, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const highlightKeywords = (text) => {
  if (!text) return '';
  const patterns = [
    { regex: /\b(excellent|great|outstanding|improved?)\b/gi, color: '#2E7D32' },
    { regex: /\b(needs improvement|consider|could|attention)\b/gi, color: '#CDAA00' },
    { regex: /\b(recommended|suggests?|next step|ai)\b/gi, color: '#003366' },
  ];
  let result = text;
  patterns.forEach(({ regex, color }) => {
    result = result.replace(
      regex,
      (match) => `<span style="color:${color};font-weight:600">${match}</span>`
    );
  });
  return result;
};

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

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/teacher/analytics', {
          params: { role: user?.role, name: user?.name || user?.fullName },
        });
        if (!isMounted) return;

        setDashboardData({
          lessonNotes: res.data?.lessonNotes ?? 0,
          quizzes: res.data?.quizzes ?? 0,
          engagementRate: res.data?.engagementRate ?? '0%',
          aiLessons: res.data?.aiLessons ?? 0,
        });

        const text = res?.data?.insight || res?.data?.message || '';
        setAiInsights(text);
      } catch (err) {
        console.error('Failed to load teacher analytics', err);
        if (isMounted)
          setAiError(err?.response?.data?.message || 'Failed to load teacher analytics.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) fetchAnalytics();
    return () => {
      isMounted = false;
    };
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
          Welcome back, {user?.name || user?.fullName || 'Teacher'} — here’s a quick look at your teaching stats.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[
            { label: 'Lesson Notes', value: dashboardData?.lessonNotes ?? 0 },
            { label: 'Quizzes Created', value: dashboardData?.quizzes ?? 0 },
            { label: 'Student Engagement', value: dashboardData?.engagementRate ?? '0%' },
            { label: 'AI Lessons Generated', value: dashboardData?.aiLessons ?? 0 },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6">{item.label}</Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {user && (
          <>
            {aiError ? (
              <Typography color="error" sx={{ mt: 3 }}>
                {aiError}
              </Typography>
            ) : (
              <AIInsightsCard
                title={`Your Teaching Highlights, ${user.name || user.fullName || 'Teacher'}`}
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
