// /client/src/pages/AdminAnalytics.jsx
import React, { useEffect } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAnalyticsOverview,
  getTopTeachers,
  getTopStudents,
} from '../features/admin/adminSlice';

const card = (label, value, delay = 0) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      sx={{
        p: 3,
        borderRadius: 3,
        textAlign: 'center',
        borderLeft: '6px solid #1E8449',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" color="primary" fontWeight={800}>
        {value}
      </Typography>
    </Paper>
  </Grid>
);

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const {
    analyticsOverview,
    topTeachers,
    topStudents,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        await Promise.all([
          dispatch(getAnalyticsOverview()).unwrap(),
          dispatch(getTopTeachers()).unwrap(),
          dispatch(getTopStudents()).unwrap(),
        ]);
      } catch {
        // Error state is handled by admin slice
      }
    };

    fetchAnalytics();
  }, [dispatch]);

  if (isLoading && !analyticsOverview && topTeachers.length === 0 && topStudents.length === 0) {
    return <Typography color="text.secondary">Loading analytics...</Typography>;
  }

  if (isError && !analyticsOverview) {
    return <Typography color="error">{message || 'Failed to load analytics.'}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {/* Overview cards */}
      {card('Teachers', analyticsOverview?.totalTeachers ?? 0, 0.05)}
      {card('Students', analyticsOverview?.totalStudents ?? 0, 0.1)}
      {card('Notes', analyticsOverview?.totalNotes ?? 0, 0.15)}
      {card('Quizzes', analyticsOverview?.totalQuizzes ?? 0, 0.2)}

      {/* Top Teachers */}
      <Grid item xs={12} md={6}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid #1D8348' }}
        >
          <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
            Top Teachers
          </Typography>
          {topTeachers.length === 0 ? (
            <Typography color="text.secondary">No teacher data.</Typography>
          ) : (
            topTeachers.map((t, i) => (
              <Typography key={i} variant="body2" color="text.secondary">
                {i + 1}. {t._id?.fullName || t._id?.name || 'Unknown'} — {t.totalNotes} notes
              </Typography>
            ))
          )}
        </Paper>
      </Grid>

      {/* Top Students */}
      <Grid item xs={12} md={6}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid #28B463' }}
        >
          <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
            Top Students
          </Typography>
          {topStudents.length === 0 ? (
            <Typography color="text.secondary">No student data.</Typography>
          ) : (
            topStudents.map((s, i) => (
              <Typography key={i} variant="body2" color="text.secondary">
                {i + 1}. {s._id?.fullName || s._id?.name || 'Unknown'} —{' '}
                {(s.avgScore * 100).toFixed(1)}%
              </Typography>
            ))
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminAnalytics;
