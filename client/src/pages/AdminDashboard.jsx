import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import {
  getStats,
  getAiInsights,
  getAnalyticsOverview,
  getTopTeachers,
  getTopStudents,
} from '../features/admin/adminSlice';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.6 } },
});

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, aiInsights, overview, topTeachers, topStudents, isLoading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
    dispatch(getAnalyticsOverview());
    dispatch(getTopTeachers());
    dispatch(getTopStudents());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ height: '80vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {/* ================== STATS CARDS ================== */}
      <Grid item xs={12} md={3}>
        <Paper component={motion.div} {...fadeUp(0.1)} sx={{ p: 3, borderLeft: '6px solid #1976D2', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Total Users</Typography>
          <Typography variant="h4" color="primary">{stats.totalUsers ?? 0}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper component={motion.div} {...fadeUp(0.2)} sx={{ p: 3, borderLeft: '6px solid #2E7D32', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Total Schools</Typography>
          <Typography variant="h4" color="primary">{stats.totalSchools ?? 0}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper component={motion.div} {...fadeUp(0.3)} sx={{ p: 3, borderLeft: '6px solid #D32F2F', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Total Quizzes</Typography>
          <Typography variant="h4" color="primary">{stats.totalQuizzes ?? 0}</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper component={motion.div} {...fadeUp(0.4)} sx={{ p: 3, borderLeft: '6px solid #F57C00', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>Pending Users</Typography>
          <Typography variant="h4" color="primary">{stats.pendingUsers ?? 0}</Typography>
        </Paper>
      </Grid>

      {/* ================== AI INSIGHTS ================== */}
      {aiInsights && (
        <Grid item xs={12}>
          <Paper component={motion.div} {...fadeUp(0.5)} sx={{ p: 3, borderLeft: '6px solid #6A1B9A', borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
              AI Summary Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {aiInsights.summary || 'No AI insights available.'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Source: {aiInsights.provider} ({aiInsights.model})
            </Typography>
          </Paper>
        </Grid>
      )}

      {/* ================== NEW OVERVIEW SECTION ================== */}
      <Grid item xs={12} md={6}>
        <Paper component={motion.div} {...fadeUp(0.7)} sx={{ p: 3, borderLeft: '6px solid #1E8449', borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
            Teacher & Student Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">Total Teachers: {overview.totalTeachers ?? 0}</Typography>
          <Typography variant="body1" color="text.secondary">Total Students: {overview.totalStudents ?? 0}</Typography>
          <Typography variant="body1" color="text.secondary">Total Notes: {overview.totalNotes ?? 0}</Typography>
          <Typography variant="body1" color="text.secondary">Total Quizzes: {overview.totalQuizzes ?? 0}</Typography>
        </Paper>
      </Grid>

      {/* ================== TOP TEACHERS ================== */}
      <Grid item xs={12} md={6}>
        <Paper component={motion.div} {...fadeUp(0.8)} sx={{ p: 3, borderLeft: '6px solid #1D8348', borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
            Top Teachers
          </Typography>
          {topTeachers.length > 0 ? (
            topTeachers.map((t, i) => (
              <Typography key={i} variant="body2" color="text.secondary">
                {i + 1}. {t._id?.fullName || t._id?.name || 'Unknown'} — {t.totalNotes} Notes
              </Typography>
            ))
          ) : (
            <Typography color="text.secondary">No teacher data available.</Typography>
          )}
        </Paper>
      </Grid>

      {/* ================== TOP STUDENTS ================== */}
      <Grid item xs={12} md={6}>
        <Paper component={motion.div} {...fadeUp(0.9)} sx={{ p: 3, borderLeft: '6px solid #28B463', borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
            Top Students
          </Typography>
          {topStudents.length > 0 ? (
            topStudents.map((s, i) => (
              <Typography key={i} variant="body2" color="text.secondary">
                {i + 1}. {s._id?.fullName || s._id?.name || 'Unknown'} — {(s.avgScore * 100).toFixed(1)}%
              </Typography>
            ))
          ) : (
            <Typography color="text.secondary">No student data available.</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;
