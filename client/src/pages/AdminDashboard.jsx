import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStats, getAiInsights } from '../../features/admin/adminSlice';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      textAlign: 'center',
      borderLeft: `6px solid ${color}`,
      borderRadius: 2,
    }}
    component={motion.div}
    whileHover={{ scale: 1.03 }}
  >
    <Typography variant="h6" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h4" fontWeight="bold">
      {value ?? 0}
    </Typography>
  </Paper>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, aiInsights, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress color="primary" />
        <Typography mt={2}>Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" mt={4}>
        Failed to load analytics: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={stats?.totalUsers} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Schools" value={stats?.totalSchools} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Quizzes Taken" value={stats?.totalAttempts} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Approvals" value={stats?.pendingUsers || 0} color="warning.main" />
        </Grid>
      </Grid>

      {/* 🧠 AI Insights Section */}
      {aiInsights && (
        <Paper
          sx={{ p: 3, mt: 5, borderLeft: '6px solid #6c63ff', borderRadius: 2 }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h6" gutterBottom>
            AI Insights
          </Typography>
          <Typography variant="body1" color="text.secondary" whiteSpace="pre-line">
            {aiInsights}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AdminDashboard;
