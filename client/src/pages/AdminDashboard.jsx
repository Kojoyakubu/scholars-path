// /client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getStats, getAiInsights } from '../features/admin/adminSlice';

import AdminCurriculum from './AdminCurriculum';
import AdminUsers from './AdminUsers';
import AdminSchools from './AdminSchools';
import AdminAnalytics from './AdminAnalytics';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const TabPanel = ({ index, value, children }) => {
  const visible = value === index;
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div key={index} {...fade} style={{ width: '100%' }}>
          <Box sx={{ mt: 3 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, aiInsights, isLoading, isError, message } = useSelector((s) => s.admin);
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: '#145A32',
          color: '#E8F5E9',
          boxShadow: '0 8px 20px rgba(20,90,50,0.3)',
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Admin Control Center
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Welcome back, {user?.name || user?.fullName || 'Admin'}! Manage users, schools, curriculum, and platform analytics.
        </Typography>
      </Paper>

      {/* Error Alert */}
      {isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {message || 'Failed to load admin data. Please try again.'}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ mt: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Dashboard" />
          <Tab label="Users" />
          <Tab label="Schools" />
          <Tab label="Curriculum" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Dashboard Tab */}
      <TabPanel value={tab} index={0}>
        {isLoading ? (
          <Grid container justifyContent="center" sx={{ mt: 6 }}>
            <CircularProgress />
            <Typography sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
              Loading admin data...
            </Typography>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {/* Quick Stats */}
            {[
              { label: 'Total Users', value: stats?.totalUsers ?? 0, color: '#1E8449' },
              { label: 'Total Schools', value: stats?.totalSchools ?? 0, color: '#28B463' },
              { label: 'Quiz Attempts', value: stats?.totalQuizAttempts ?? 0, color: '#1D8348' },
              { label: 'Pending Users', value: stats?.pendingUsers ?? 0, color: '#145A32' },
            ].map((card, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper
                  component={motion.div}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * i }}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderLeft: `6px solid ${card.color}`,
                    borderRadius: 3,
                    boxShadow: '0 4px 15px rgba(20,90,50,0.18)',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary">
                    {card.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}

            {/* AI Insights */}
            <Grid item xs={12}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                sx={{
                  p: 3,
                  borderLeft: '6px solid #6A1B9A',
                  borderRadius: 3,
                  bgcolor: '#F3E5F5',
                }}
              >
                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                  AI Insights Summary
                </Typography>
                {aiInsights ? (
                  <>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {aiInsights?.summary || aiInsights}
                    </Typography>
                    {aiInsights?.provider && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                        Generated by {aiInsights.provider} {aiInsights.model ? `(${aiInsights.model})` : ''}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No AI insights available yet. Data is being processed...
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tab} index={1}>
        <AdminUsers />
      </TabPanel>

      {/* Schools Tab */}
      <TabPanel value={tab} index={2}>
        <AdminSchools />
      </TabPanel>

      {/* Curriculum Tab */}
      <TabPanel value={tab} index={3}>
        <AdminCurriculum />
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tab} index={4}>
        <AdminAnalytics />
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard;