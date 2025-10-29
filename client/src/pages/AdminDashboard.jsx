// /client/src/pages/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { getStats, getAiInsights } from '../features/admin/adminSlice'; // ✅ Fixed path

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  viewport: { once: false, amount: 0.2 },
});

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, aiInsights, isLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F9FBE7', minHeight: '100vh' }}>
      <Box
        component={motion.div}
        {...fadeUp(0)}
        sx={{
          textAlign: 'center',
          bgcolor: '#145A32',
          color: '#E8F5E9',
          py: 4,
          borderRadius: 3,
          mb: 4,
          boxShadow: '0 8px 20px rgba(20,90,50,0.4)',
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Welcome Back, {user?.fullName?.split(' ')[0]} 🌿
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Administrative Overview & AI-Powered Insights
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress color="success" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* STATS CARDS */}
          {stats && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  {...fadeUp(0.1)}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderLeft: '6px solid #1E8449',
                    borderRadius: 3,
                    boxShadow: '0 4px 15px rgba(20,90,50,0.2)',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {stats.totalUsers ?? 0}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  {...fadeUp(0.2)}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderLeft: '6px solid #28B463',
                    borderRadius: 3,
                    boxShadow: '0 4px 15px rgba(20,90,50,0.2)',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Total Schools
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {stats.totalSchools ?? 0}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  {...fadeUp(0.3)}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderLeft: '6px solid #1D8348',
                    borderRadius: 3,
                    boxShadow: '0 4px 15px rgba(20,90,50,0.2)',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Total Quizzes
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {stats.totalQuizzes ?? 0}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  component={motion.div}
                  {...fadeUp(0.4)}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderLeft: '6px solid #145A32',
                    borderRadius: 3,
                    boxShadow: '0 4px 15px rgba(20,90,50,0.2)',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Pending Users
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {stats.pendingUsers ?? 0}
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}

          {/* AI INSIGHTS CARD */}
          <Grid item xs={12}>
            <Paper
              component={motion.div}
              {...fadeUp(0.6)}
              sx={{
                p: 4,
                borderLeft: '6px solid #145A32',
                borderRadius: 3,
                bgcolor: '#F1F8E9',
                boxShadow: '0 6px 18px rgba(20,90,50,0.25)',
              }}
            >
              <Typography variant="h5" gutterBottom fontWeight={700} color="primary">
                AI Insights Summary
              </Typography>

              {aiInsights ? (
                <>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line' }}
                  >
                    {aiInsights.summary || aiInsights}
                  </Typography>

                  {aiInsights.provider && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}
                    >
                      Generated by {aiInsights.provider} ({aiInsights.model || 'AI model'})
                    </Typography>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">
                  No AI insights available yet. Please try again later.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;
