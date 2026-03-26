// /client/src/pages/SchoolDashboard.jsx

import React, { useEffect, useRef, useState } from 'react';
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
  useMediaQuery,
  Button,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import AIInsightsCard from '../components/AIInsightsCard';
import { getSchoolDashboard } from '../features/school/schoolSlice';

const SchoolDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const insightsRef = useRef(null);
  const { user } = useSelector((state) => state.auth || {});
  const { dashboardData, isLoading, isError, message } = useSelector((state) => state.school || {});
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  // Load dashboard metrics
  useEffect(() => {
    dispatch(getSchoolDashboard());
  }, [dispatch]);

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

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading school dashboard…</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">
          {message || 'Failed to load school dashboard.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.6rem', sm: '2rem', md: '2.125rem' } }}>
          School Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Welcome back, {user?.fullName || 'Administrator'} — here’s your school’s current overview.
        </Typography>
        <Button
          variant="contained"
          size={isMobile ? 'large' : 'medium'}
          fullWidth={isMobile}
          sx={{ mt: 1.5, mb: 1.5, maxWidth: { xs: '100%', sm: 280 } }}
          onClick={() => insightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          View AI Insights
        </Button>

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

        <Box ref={insightsRef}>
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
        </Box>
      </Container>
    </Box>
  );
};

export default SchoolDashboard;
