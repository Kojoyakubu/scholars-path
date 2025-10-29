// /client/src/pages/SchoolDashboard.jsx

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

// Inline AI Insights component
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

const SchoolDashboard = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth || {});
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  // Load dashboard metrics
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/school/summary');
        if (isMounted) setDashboardData(res.data);
      } catch (err) {
        console.error('Failed to load school dashboard', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Load personalized AI school insights
  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        const res = await api.get('/api/school/insights', {
          params: { role: user?.role, name: user?.fullName, school: user?.schoolName },
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
        <Typography mt={2}>Loading school dashboard…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={700} gutterBottom>
          School Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Welcome back, {user?.fullName || 'Administrator'} — here’s your school’s current overview.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">Total Teachers</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.teachersCount ?? 0}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">Total Students</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.studentsCount ?? 0}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">Active Classes</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.classesCount ?? 0}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6">Completed Quizzes</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {dashboardData?.completedQuizzes ?? 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Performing Classes
              </Typography>
              {dashboardData?.topClasses?.length > 0 ? (
                dashboardData.topClasses.map((cls, i) => (
                  <Typography key={i} color="text.secondary">
                    {cls.name} — Average Score: <b>{cls.avgScore}%</b>
                  </Typography>
                ))
              ) : (
                <Typography color="text.secondary">No data available</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Teacher Activity
              </Typography>
              {dashboardData?.recentTeachers?.length > 0 ? (
                dashboardData.recentTeachers.map((t, i) => (
                  <Typography key={i} color="text.secondary">
                    {t.name} — {t.activity}
                  </Typography>
                ))
              ) : (
                <Typography color="text.secondary">No recent activity</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* AI Insights Section */}
        {user && (
          <>
            {aiError ? (
              <Typography color="error" sx={{ mt: 3 }}>
                {aiError}
              </Typography>
            ) : (
              <AIInsightsCard
                title={`AI Insights for ${user.fullName || 'School Admin'}`}
                content={
                  aiInsights ||
                  `Analyzing engagement trends for ${user?.schoolName || 'your institution'}...`
                }
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default SchoolDashboard;
