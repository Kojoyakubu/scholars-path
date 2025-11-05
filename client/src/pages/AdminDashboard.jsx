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
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getStats, getAiInsights } from '../features/admin/adminSlice';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import AdminCurriculum from './AdminCurriculum';
import AdminUsers from './AdminUsers';
import AdminSchools from './AdminSchools';
import AdminAnalytics from './AdminAnalytics';

const fade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const TabPanel = ({ index, value, children }) => {
  const visible = value === index;
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div key={index} {...fade} style={{ width: '100%' }}>
          <Box sx={{ mt: 4 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modern Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const theme = useTheme();
  
  return (
    <Grid item xs={12} sm={6} lg={3}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
            border: `1px solid ${alpha(color, 0.1)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 40px ${alpha(color, 0.2)}`,
              border: `1px solid ${alpha(color, 0.3)}`,
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    mb: 1,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  {value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: color,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Active
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { stats, aiInsights, isLoading, isError, message } = useSelector((s) => s.admin);
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch]);

  const statCards = [
    { icon: PeopleIcon, label: 'Total Users', value: stats?.totalUsers ?? 0, color: '#2196F3' },
    { icon: SchoolIcon, label: 'Total Schools', value: stats?.totalSchools ?? 0, color: '#9C27B0' },
    { icon: QuizIcon, label: 'Quiz Attempts', value: stats?.totalQuizAttempts ?? 0, color: '#FF9800' },
    { icon: PendingActionsIcon, label: 'Pending Users', value: stats?.pendingUsers ?? 0, color: '#F44336' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', pb: 6 }}>
      {/* Hero Header */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              {(user?.name || user?.fullName || 'A').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                  mb: 0.5,
                }}
              >
                Welcome back, {user?.name || user?.fullName || 'Admin'}! 👋
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                }}
              >
                Here's what's happening with Scholar's Path today
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, mt: -3 }}>
        {/* Error Alert */}
        {isError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                background: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              {message || 'Failed to load admin data. Please try again.'}
            </Alert>
          </motion.div>
        )}

        {/* Tabs */}
        <Paper
          sx={{
            borderRadius: 3,
            mb: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                minHeight: 64,
              },
              '& .Mui-selected': {
                color: '#667eea',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              },
            }}
          >
            <Tab label="📊 Dashboard" />
            <Tab label="👥 Users" />
            <Tab label="🏫 Schools" />
            <Tab label="📚 Curriculum" />
            <Tab label="📈 Analytics" />
          </Tabs>
        </Paper>

        {/* Dashboard Tab */}
        <TabPanel value={tab} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress size={60} sx={{ color: 'white' }} />
            </Box>
          ) : (
            <>
              {/* Stats Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((card, i) => (
                  <StatCard key={i} {...card} delay={0.1 * i} />
                ))}
              </Grid>

              {/* AI Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(103, 126, 234, 0.2)',
                    boxShadow: '0 8px 32px rgba(103, 126, 234, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 20px rgba(103, 126, 234, 0.3)',
                      }}
                    >
                      <AutoAwesomeIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        AI-Powered Insights
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Smart analytics for better decisions
                      </Typography>
                    </Box>
                  </Box>

                  {aiInsights ? (
                    <>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.primary,
                          lineHeight: 1.8,
                          fontSize: '1rem',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {aiInsights?.summary || aiInsights}
                      </Typography>
                      {aiInsights?.provider && (
                        <Box
                          sx={{
                            mt: 3,
                            pt: 2,
                            borderTop: `1px solid ${alpha('#667eea', 0.1)}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 16, color: '#667eea' }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontStyle: 'italic',
                            }}
                          >
                            Generated by {aiInsights.provider}
                            {aiInsights.model && ` (${aiInsights.model})`}
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      🤖 Analyzing platform data... AI insights will appear here shortly.
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            </>
          )}
        </TabPanel>

        {/* Other Tabs */}
        <TabPanel value={tab} index={1}>
          <AdminUsers />
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <AdminSchools />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <AdminCurriculum />
        </TabPanel>

        <TabPanel value={tab} index={4}>
          <AdminAnalytics />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default AdminDashboard;